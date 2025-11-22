import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const { email, name, password, cnic, phone } = await req.json();

    // Validate required fields
    if (!email || !name || !password || !cnic) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { cnic }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      if (existingUser.cnic === cnic) {
        return NextResponse.json(
          { error: "CNIC already registered" },
          { status: 400 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await prisma.OTP.deleteMany({
      where: { email },
    });

    // Store OTP in database
    await prisma.OTP.create({
      data: {
        email,
        phoneNumber: phone || "", // Include phone field to satisfy database constraint
        code: otp,
        expiresAt,
        verified: false,
        metaData: JSON.stringify({ name, email, password, cnic, phone }),
      },
    });

    // Send email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("Resend API key not configured");
      return NextResponse.json(
        { error: "Email service not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: "NADRA System <onboarding@resend.dev>",
        to: email,
        subject: "Your NADRA Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #047857;">NADRA Account Verification</h2>
            <p>Hello ${name},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #047857; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } catch (resendError) {
      console.error("Resend email error:", resendError);
      
      // Delete the OTP since we couldn't send it
      await prisma.OTP.deleteMany({
        where: { email, code: otp },
      });

      return NextResponse.json(
        { error: "Failed to send email. Please check your email address." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

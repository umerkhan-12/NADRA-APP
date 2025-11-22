import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const { email, name, password, cnic, phone } = await req.json();

    // Validate required fields (CNIC is optional)
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
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
    const whereConditions = [{ email }];
    if (cnic) {
      whereConditions.push({ cnic });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      if (cnic && existingUser.cnic === cnic) {
        return NextResponse.json(
          { error: "CNIC already registered" },
          { status: 400 }
        );
      }
    }

    // ✅ RATE LIMITING: Check recent OTP requests (max 3 per 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOTPs = await prisma.OTP.count({
      where: {
        email,
        createdAt: {
          gte: fifteenMinutesAgo
        }
      }
    });

    if (recentOTPs >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait 15 minutes before trying again." },
        { status: 429 } // Too Many Requests
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expireat = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await prisma.OTP.deleteMany({
      where: { email },
    });

    // Store OTP in database
    await prisma.OTP.create({
      data: {
        email,
        phoneNumber: phone || null,
        code: otp,
        expireat,
        verified: false,
        attempts: 0,
        metaData: JSON.stringify({ name, email, password, cnic, phone }),
      },
    });

    // Send email using nodemailer
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
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
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      
      // Delete the OTP since we couldn't send it
      await prisma.OTP.deleteMany({
        where: { email, code: otp },
      });

      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
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

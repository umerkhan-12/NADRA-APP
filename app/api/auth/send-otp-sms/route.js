import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilio from "twilio";

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const { phone, name, email, password, cnic } = await req.json();

    // Validate required fields
    if (!phone || !name || !email || !password || !cnic) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate phone number format (Pakistani format: +92XXXXXXXXXX)
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use +92XXXXXXXXXX" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { cnic }, { phone }],
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
      if (existingUser.phone === phone) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 400 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        phoneNumber: phone,
        code: otp,
        expiresAt,
        verified: false,
        // Store user data temporarily for registration after verification
        metadata: JSON.stringify({ name, email, password, cnic }),
      },
    });

    // Send SMS using Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Twilio credentials not configured");
      return NextResponse.json(
        { error: "SMS service not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    try {
      await client.messages.create({
        body: `Your NADRA verification code is: ${otp}. Valid for 10 minutes.`,
        from: twilioPhoneNumber,
        to: phone,
      });

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your phone number",
      });
    } catch (twilioError) {
      console.error("Twilio SMS error:", twilioError);
      
      // Delete the OTP since we couldn't send it
      await prisma.oTP.deleteMany({
        where: { phoneNumber: phone, code: otp },
      });

      return NextResponse.json(
        { error: "Failed to send SMS. Please check your phone number." },
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

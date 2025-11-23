import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    // Find the OTP record
    const otpRecord = await prisma.OTP.findFirst({
      where: { email, code: otp }
    });

    if (!otpRecord) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid OTP code" 
      });
    }

    // Check if OTP is expired
    if (otpRecord.expireat && new Date() > new Date(otpRecord.expireat)) {
      await prisma.OTP.deleteMany({ where: { email } });
      return NextResponse.json({ 
        success: false, 
        error: "OTP has expired. Please request a new one." 
      });
    }

    // Parse user data from metaData
    let userData;
    try {
      userData = JSON.parse(otpRecord.metaData || "{}");
    } catch (err) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid registration data. Please start over." 
      });
    }

    const { name, phone, password } = userData;

    if (!name || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required registration data. Please start over." 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      await prisma.OTP.deleteMany({ where: { email } });
      return NextResponse.json({ 
        success: false, 
        error: "This email is already registered. Please login instead." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: "USER",
        cnic: null,
      },
    });

    // Delete used OTP
    await prisma.OTP.deleteMany({ where: { email } });

    return NextResponse.json({ 
      success: true,
      message: "Account created successfully! You can now login."
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    
    // Check for unique constraint violation
    if (err.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: "This email is already registered. Please login." 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Verification failed. Please try again."
    });
  }
}

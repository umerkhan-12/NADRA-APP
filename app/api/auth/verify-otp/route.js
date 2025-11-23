import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password, otp } = await req.json();

    // Verify OTP
    const check = await prisma.OTP.findFirst({
      where: { email, code: otp }
    });

    if (!check) {
      return NextResponse.json({ success: false, error: "Invalid OTP code" });
    }

    // Check if OTP is expired
    if (check.expireat && new Date() > new Date(check.expireat)) {
      await prisma.OTP.deleteMany({ where: { email } });
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email },
          { cnic: phone } // In case phone was used as CNIC
        ]
      }
    });

    if (existingUser) {
      // Delete OTP and return error
      await prisma.OTP.deleteMany({ where: { email } });
      return NextResponse.json({ 
        success: false, 
        error: "This email or CNIC is already registered. Please login instead." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
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
        error: "This email or CNIC is already registered. Please login." 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Verification failed. Please try again."
    });
  }
}

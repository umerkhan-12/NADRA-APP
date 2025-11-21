import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "This email is already registered. Please login.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user directly (skip OTP)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Account created successfully! You can now login."
    });
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Registration failed"
    });
  }
}

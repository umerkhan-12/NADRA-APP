import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await prisma.OTP.findFirst({
      where: {
        email,
        code: otp,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await prisma.OTP.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Parse user data from metadata
    let userData;
    try {
      userData = JSON.parse(otpRecord.metaData);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid registration data" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        password: hashedPassword,
        cnic: userData.cnic,
        role: "USER",
      },
    });

    // Mark OTP as verified
    await prisma.OTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Delete old OTPs for this email
    await prisma.OTP.deleteMany({
      where: {
        email,
        id: { not: otpRecord.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User with this email or CNIC already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

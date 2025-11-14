import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password, otp } = await req.json();

    const check = await prisma.OTP.findFirst({
      where: { email, code: otp }
    });

    if (!check) {
      return NextResponse.json({ success: false, error: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    await prisma.OTP.deleteMany({ where: { email } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

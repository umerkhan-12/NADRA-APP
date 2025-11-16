import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || admin.password !== password) {
      return NextResponse.json({ success: false, error: "Invalid admin credentials" });
    }

    return NextResponse.json({
      success: true,
      adminId: admin.id,
      role: "ADMIN",
      name: admin.name,
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

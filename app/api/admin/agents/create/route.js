import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, username, password } = await req.json();

    // Validate input
    if (!name || !email || !username || !password) {
      return NextResponse.json({ success: false, error: "All fields are required." });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent
    const newAgent = await prisma.agent.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

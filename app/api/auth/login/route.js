
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password, role,name } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    let user = null;

    // For Citizen & Admin — use User table
    if (role === "USER" || role === "ADMIN") {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Prevent wrong dashboard access
      if (user.role !== role) {
        return NextResponse.json(
          { error: `This account is not allowed to login as ${role}` },
          { status: 403 }
        );
      }
    }

    // For Agent — use Agent table
    else if (role === "AGENT") {
      user = await prisma.agent.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Agent not found" },
          { status: 404 }
        );
      }
    }

    // Invalid role
    else {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // SUCCESS LOGIN
    return NextResponse.json({
      success: true,
      message: "Login successful",
      name: user.name,
      role,
      userId: user.id,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, fee, defaultPriority } = await req.json();

    const service = await prisma.service.create({
      data: { name, fee: Number(fee), defaultPriority },
    });

    return NextResponse.json({ success: true, service });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

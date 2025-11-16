import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { serviceId } = await req.json();

    await prisma.service.delete({
      where: { id: Number(serviceId) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

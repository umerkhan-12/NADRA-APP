import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { user: true, ticket: true },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

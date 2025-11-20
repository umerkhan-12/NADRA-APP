import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: true,
        service: true,
        payment: true,
        documents: true,
        delivery: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

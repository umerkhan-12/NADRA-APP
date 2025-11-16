import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await prisma.ticketLog.findMany({
      orderBy: { time: "desc" },
      
    });

    return NextResponse.json({ logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ logs: [], error: err.message });
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await prisma.ticketLog.findMany({
      orderBy: { createdAt: "desc" },
    //   take: 100, // optional limit
    });
    return NextResponse.json({ logs }); // must return { logs: [...] }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ logs: [], error: err.message });
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ agents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ agents: [], error: err.message });
  }
}



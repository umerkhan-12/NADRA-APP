import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const agentId = req.headers.get("agentId");

  if (!agentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.agent.findUnique({
    where: { id: Number(agentId) },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      maxTickets: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ agent });
}

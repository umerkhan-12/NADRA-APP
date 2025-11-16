import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  // Unwrap params because it is a Promise
  const params = await context.params;
  const agentId = parseInt(params.id, 10);

  if (!agentId) {
    return NextResponse.json({ success: false, error: "Invalid agent ID" });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { agentId: agentId }, // make sure your Prisma field is `agentId`
      include: {
        user: true,
        service: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}

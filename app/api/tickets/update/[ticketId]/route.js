import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req, context) {
  // Unwrap params
  const params = await context.params;
  const ticketId = parseInt(params.ticketId, 10);

  if (!ticketId) {
    return NextResponse.json({ success: false, error: "Invalid ticket ID" });
  }

  const { status } = await req.json();

  try {
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Update failed" });
  }
}

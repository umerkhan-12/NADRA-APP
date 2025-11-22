import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    // Unwrap params
    const params = await context.params;  // <-- add await here
    const userId = parseInt(params.userId, 10);

    if (!userId) return NextResponse.json({ tickets: [] });

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: { 
        service: {
          include: {
            requiredDocuments: {
              orderBy: [
                { isMandatory: 'desc' },
                { documentName: 'asc' }
              ]
            }
          }
        },
        documents: true,
        delivery: true,
        payment: true, // Include payment information
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedTickets = tickets.map(t => ({
      id: t.id,
      serviceName: t.service?.name || "Unknown",
      status: t.status,
      customerPriority: t.customerPriority,
      createdAt: t.createdAt,
      fee: t.service.fee,
      documents: t.documents || [],
      delivery: t.delivery || null,
      requiredDocuments: t.service?.requiredDocuments || [],
      payment: t.payment || null, // Include payment in response
    }));

    return NextResponse.json({ tickets: formattedTickets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ tickets: [] });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    // Unwrap params
    const params = await context.params;  // <-- add await here
    const userId = parseInt(params.userId, 10);

    if (!userId) return NextResponse.json({ tickets: [] });

    // ✅ OPTIMIZED: Use select instead of include to reduce data transfer
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        customerPriority: true,
        queuePosition: true,
        createdAt: true,
        service: {
          select: {
            id: true,
            name: true,
            fee: true,
            requiredDocuments: {
              select: {
                id: true,
                documentName: true,
                description: true,
                isMandatory: true
              },
              orderBy: [
                { isMandatory: 'desc' },
                { documentName: 'asc' }
              ]
            }
          }
        },
        documents: {
          select: {
            id: true,
            filePath: true,
            fileType: true,
            uploadedAt: true
          }
        },
        delivery: {
          select: {
            id: true,
            status: true,
            trackingNumber: true,
            address: true,
            city: true,
            phone: true
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            paymentMethod: true,
            transactionId: true,
            paidAt: true
          }
        }
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
      payment: t.payment || null,
      queuePosition: t.queuePosition,
    }));

    return NextResponse.json({ tickets: formattedTickets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ tickets: [] });
  }
}

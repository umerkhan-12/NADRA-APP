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
    // ✅ OPTIMIZED: Use select to only fetch needed fields
    const tickets = await prisma.ticket.findMany({
      where: { agentId: agentId }, 
      select: {
        id: true,
        status: true,
        queuePosition: true,
        customerPriority: true,
        createdAt: true,
        closedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            fee: true
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
            phone: true,
            agentName: true,
            agentPhone: true,
            estimatedDelivery: true,
            notes: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}

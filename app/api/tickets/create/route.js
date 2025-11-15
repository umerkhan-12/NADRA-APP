import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function priorityToNumber(priority) {
  if (priority === "HIGH" || priority === "URGENT") return 3;
  if (priority === "MEDIUM") return 2;
  if (priority === "LOW" || priority === "NORMAL") return 1;
  return 1;
}

export async function POST(req) {
  try {
    const { serviceId, customerPriority, userId } = await req.json();

    const numericuserId = parseInt(userId, 10);
    const numericServiceId = parseInt(serviceId, 10);

    if (!numericuserId || !numericServiceId || !customerPriority) {
      return NextResponse.json(
        { success: false, error: "Invalid userId, serviceId or priority" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: numericServiceId },
    });

    if (!service) return NextResponse.json({ success: false, error: "Service not found" });

    const finalPriority = Math.min(
      3,
      Math.max(1, priorityToNumber(service.defaultPriority || "NORMAL") + priorityToNumber(customerPriority))
    );

    const ticket = await prisma.ticket.create({
      data: {
        userId: numericuserId,
        serviceId: numericServiceId,
        servicePriority: service.defaultPriority || "NORMAL",
        customerPriority,
        finalPriority,
      },
    });

    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        message: `Ticket created with priority ${customerPriority}`,
      },
    });

    await prisma.payment.create({
      data: {
        userId: numericuserId,
        ticketId: ticket.id,
        amount: service.fee || service.price || 0,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message || "Something went wrong" }, { status: 500 });
  }
}

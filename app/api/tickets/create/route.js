
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function priorityToNumber(priority) {
  if (priority === "HIGH" || priority === "URGENT") return 3;
  if (priority === "MEDIUM") return 2;
  if (priority === "LOW" || priority === "NORMAL") return 1;
  return 1;
}

// Helper: find available agent with least tickets and matching priority
async function assignAgent(finalPriority) {
  // Get all agents
  const agents = await prisma.agent.findMany();

  if (!agents || agents.length === 0) return null;

  // Count tickets per agent
  const agentTicketCounts = await Promise.all(
    agents.map(async (agent) => {
      const count = await prisma.ticket.count({
        where: { agentId: agent.id, status: { not: "COMPLETED" } },
      });
      return { agent, count };
    })
  );

  // Sort by least tickets first
  agentTicketCounts.sort((a, b) => a.count - b.count);

  // Return the first agent (least busy)
  return agentTicketCounts[0].agent;
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
      Math.max(
        1,
        priorityToNumber(service.defaultPriority || "NORMAL") +
          priorityToNumber(customerPriority)
      )
    );

    // Assign agent based on availability and priority
    const agent = await assignAgent(finalPriority);

    const ticket = await prisma.ticket.create({
      data: {
        userId: numericuserId,
        serviceId: numericServiceId,
        servicePriority: service.defaultPriority || "NORMAL",
        customerPriority,
        finalPriority,
        agentId: agent?.id || null, // assign agent if found
      },
    });

    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        message: `Ticket created with priority ${customerPriority}${
          agent ? ` and assigned to agent ${agent.name}` : ""
        }`,
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
    return NextResponse.json(
      { success: false, error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

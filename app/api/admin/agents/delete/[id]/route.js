import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { assignTicketToAgent } from "@/lib/ticketHelper";

export async function DELETE(req, { params }) {
  // In Next.js App Router, params is a Promise and must be awaited
  const { id } = await params;
  const agentId = parseInt(id, 10);

  if (isNaN(agentId)) {
    return NextResponse.json(
      { success: false, error: "Invalid agent ID" },
      { status: 400 }
    );
  }

  try {
    // Check if agent exists
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Unassign all tickets from this agent and reset status to OPEN
    const unassignedTickets = await prisma.ticket.findMany({
      where: { agentId: agentId }
    });

    await prisma.ticket.updateMany({
      where: { agentId: agentId },
      data: { 
        agentId: null,
        status: 'OPEN'
      }
    });

    // Delete agent
    await prisma.agent.delete({ where: { id: agentId } });

    // Try to reassign tickets to available agents
    if (unassignedTickets.length > 0) {
      const availableAgents = await prisma.agent.findMany();
      
      for (const ticket of unassignedTickets) {
        // Find agent with least tickets
        const agentCounts = await Promise.all(
          availableAgents.map(async a => {
            const count = await prisma.ticket.count({ 
              where: { agentId: a.id, status: { not: "COMPLETED" } } 
            });
            return { agent: a, count };
          })
        );

        const available = agentCounts.filter(a => a.count < a.agent.maxTickets);
        if (available.length > 0) {
          available.sort((a, b) => a.count - b.count);
          const targetAgent = available[0].agent;
          
          // Reassign ticket
          await assignTicketToAgent(ticket, targetAgent);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Agent deleted and tickets reassigned to available agents" 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}

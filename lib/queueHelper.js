// lib/queueHelper.js
import prisma from "@/lib/prisma";

/**
 * Calculate queue position for all OPEN and IN_PROGRESS tickets
 * Based on: priority (URGENT first), then creation time (older first)
 * ✅ Uses transaction to prevent race conditions
 */
export async function recalculateQueuePositions() {
  try {
    await prisma.$transaction(async (tx) => {
      // Get all active tickets (OPEN or IN_PROGRESS)
      const activeTickets = await tx.ticket.findMany({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"]
          }
        },
        orderBy: [
          { customerPriority: 'desc' }, // URGENT before NORMAL
          { finalPriority: 'desc' },    // Higher priority first
          { createdAt: 'asc' }          // Older tickets first
        ]
      });

      // Update queue positions sequentially within transaction
      for (let i = 0; i < activeTickets.length; i++) {
        await tx.ticket.update({
          where: { id: activeTickets[i].id },
          data: { queuePosition: i + 1 }
        });
      }

      // Set completed tickets to null queue position
      await tx.ticket.updateMany({
        where: {
          status: {
            in: ["COMPLETED", "CLOSED"]
          }
        },
        data: { queuePosition: null }
      });

      return activeTickets.length;
    });

    return { success: true };
  } catch (error) {
    console.error("Error recalculating queue positions:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get queue information for a specific ticket
 */
export async function getQueueInfo(ticketId) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        service: true,
        agent: true
      }
    });

    if (!ticket) {
      return { error: "Ticket not found" };
    }

    // If ticket is completed, no queue position
    if (ticket.status === "COMPLETED" || ticket.status === "CLOSED") {
      return {
        ticketId: ticket.id,
        status: ticket.status,
        queuePosition: null,
        message: "Ticket is completed",
        estimatedWaitTime: 0
      };
    }

    // If ticket is in progress with agent
    if (ticket.status === "IN_PROGRESS" && ticket.agentId) {
      return {
        ticketId: ticket.id,
        status: ticket.status,
        queuePosition: ticket.queuePosition,
        agentName: ticket.agent?.name,
        message: "Being processed by agent",
        estimatedWaitTime: "Processing now"
      };
    }

    // Count tickets ahead in queue (OPEN or IN_PROGRESS with higher priority or earlier time)
    const ticketsAhead = await prisma.ticket.count({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS"]
        },
        OR: [
          {
            // Higher customer priority
            customerPriority: "URGENT",
            createdAt: {
              lt: ticket.customerPriority === "URGENT" ? ticket.createdAt : new Date()
            }
          },
          {
            // Same priority but earlier
            customerPriority: ticket.customerPriority,
            createdAt: {
              lt: ticket.createdAt
            }
          }
        ]
      }
    });

    // Estimate wait time (assume 30 min per ticket)
    const estimatedMinutes = ticketsAhead * 30;
    const estimatedHours = Math.floor(estimatedMinutes / 60);
    const remainingMinutes = estimatedMinutes % 60;
    
    let estimatedWaitTime;
    if (estimatedHours > 0) {
      estimatedWaitTime = `${estimatedHours}h ${remainingMinutes}m`;
    } else {
      estimatedWaitTime = `${remainingMinutes} minutes`;
    }

    return {
      ticketId: ticket.id,
      status: ticket.status,
      queuePosition: ticket.queuePosition || ticketsAhead + 1,
      totalInQueue: await prisma.ticket.count({
        where: {
          status: { in: ["OPEN", "IN_PROGRESS"] }
        }
      }),
      priority: ticket.customerPriority,
      estimatedWaitTime,
      message: ticket.queuePosition === 1 ? "You're next!" : `${ticketsAhead} ticket(s) ahead of you`
    };
  } catch (error) {
    console.error("Error getting queue info:", error);
    return { error: error.message };
  }
}

/**
 * Assign queue position when ticket is created
 */
export async function assignQueuePosition(ticketId) {
  try {
    // Count all active tickets before this one
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return { error: "Ticket not found" };
    }

    const position = await prisma.ticket.count({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS"]
        },
        OR: [
          {
            customerPriority: "URGENT",
            createdAt: {
              lt: ticket.customerPriority === "URGENT" ? ticket.createdAt : new Date()
            }
          },
          {
            customerPriority: ticket.customerPriority,
            createdAt: {
              lt: ticket.createdAt
            }
          }
        ]
      }
    }) + 1;

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { queuePosition: position }
    });

    return { success: true, position };
  } catch (error) {
    console.error("Error assigning queue position:", error);
    return { error: error.message };
  }
}

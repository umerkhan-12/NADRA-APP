// lib/ticketHelper.js
import prisma from "@/lib/prisma";
import { Resend } from "resend";

function priorityToNumber(priority) {
  if (priority === "HIGH" || priority === "URGENT") return 3;
  if (priority === "MEDIUM") return 2;
  if (priority === "LOW" || priority === "NORMAL") return 1;
  return 1;
}

// Assign a ticket to a specific agent
export async function assignTicketToAgent(ticket, agent) {
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { agentId: agent.id, status: "IN_PROGRESS" },
    include: { user: true, service: true },
  });

  // Log
  await prisma.ticketLog.create({
    data: { ticketId: updatedTicket.id, message: `Auto-assigned to Agent ${agent.name}` },
  });

  // Email (non-blocking)
  setImmediate(async () => {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      console.log(`Sending ticket assignment email to ${updatedTicket.user.email} for ticket #${updatedTicket.id}`);
      
      const result = await resend.emails.send({
        from: "NADRA System <onboarding@resend.dev>",
        to: updatedTicket.user.email,
        subject: `Ticket #${updatedTicket.id} Assigned`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #047857;">Ticket Assigned</h2>
            <p>Your ticket for <strong>${updatedTicket.service.name}</strong> has been assigned to Agent ${agent.name}.</p>
            <p>Ticket ID: #${updatedTicket.id}</p>
            <p>Status: In Progress</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
          </div>
        `,
      });
      
      console.log("Ticket assignment email sent successfully:", result);
    } catch (err) {
      console.error("Email failed (background):", err);
      console.error("Email error details:", err.message, err.statusCode);
    }
  });

  return updatedTicket;
}

// Optional: createTicket function for full ticket creation
export async function createTicket({ serviceId, customerPriority, userId }) {
  const numericuserId = parseInt(userId, 10);
  const numericServiceId = parseInt(serviceId, 10);

  if (!numericuserId || !numericServiceId || !customerPriority) {
    throw new Error("Invalid userId, serviceId or priority");
  }

  // Fetch service
  const service = await prisma.service.findUnique({ where: { id: numericServiceId } });
  if (!service) throw new Error("Service not found");

  // Final priority
  const finalPriority = Math.min(
    3,
    priorityToNumber(service.defaultPriority || "NORMAL") +
    priorityToNumber(customerPriority)
  );

  // Find available agent
  const agents = await prisma.agent.findMany();
  let agent = null;
  if (agents.length > 0) {
    const agentCounts = await Promise.all(
      agents.map(async a => {
        const count = await prisma.ticket.count({ where: { agentId: a.id, status: { not: "COMPLETED" } } });
        return { agent: a, count };
      })
    );

    const available = agentCounts.filter(a => a.count < 5);
    if (available.length > 0) available.sort((a, b) => a.count - b.count);
    agent = available[0]?.agent || null;
  }

  // Create ticket
  const ticket = await prisma.ticket.create({
    data: {
      userId: numericuserId,
      serviceId: numericServiceId,
      servicePriority: service.defaultPriority || "NORMAL",
      customerPriority,
      finalPriority,
      status: agent ? "IN_PROGRESS" : "OPEN",
      agentId: agent?.id || null,
    },
    include: { 
      user: true, 
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
      agent: true,
      documents: true,
      delivery: true,
    },
  });

  // Create log
  await prisma.ticketLog.create({
    data: {
      ticketId: ticket.id,
      message: agent
        ? `Ticket created with priority ${customerPriority} and assigned to agent ${agent.name}`
        : `Ticket created with priority ${customerPriority} (no agent available — waiting)`,
    },
  });

  // Payment
  await prisma.payment.create({
    data: { userId: numericuserId, ticketId: ticket.id, amount: service.fee || service.price || 0, status: "PENDING" },
  });

  // Email (non-blocking - run in background)
  setImmediate(async () => {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      console.log(`Sending ticket creation email to ${ticket.user.email} for ticket #${ticket.id}`);

      const result = await resend.emails.send({
        from: "NADRA System <onboarding@resend.dev>",
        to: ticket.user.email,
        subject: `Your Ticket #${ticket.id} is Created`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #047857;">NADRA Service Ticket Created</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${ticket.service.name}</p>
              <p><strong>Ticket ID:</strong> #${ticket.id}</p>
              <p><strong>Priority:</strong> ${customerPriority}</p>
              <p><strong>Status:</strong> ${agent ? "Assigned" : "Waiting"}</p>
              ${agent ? `<p><strong>Assigned Agent:</strong> ${agent.name}</p>` : ""}
            </div>
            <p>We will keep you updated on your ticket progress.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
          </div>
        `,
      });

      console.log("Ticket creation email sent successfully:", result);
    } catch (err) {
      console.error("Email failed (background):", err);
      console.error("Email error details:", err.message, err.statusCode);
    }
  });

  return ticket;
}

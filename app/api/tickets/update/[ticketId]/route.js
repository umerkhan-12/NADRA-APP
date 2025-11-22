import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

export async function PATCH(req, context) {
  const params = await context.params;
  const ticketId = parseInt(params.ticketId, 10);

  if (!ticketId) {
    return NextResponse.json({ success: false, error: "Invalid ticket ID" });
  }

  const { status } = await req.json();

  try {
    // FIRST UPDATE STATUS and set closed time also
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status, closedAt: status === "COMPLETED" ? new Date() : null },
      include: { agent: true, user: true, service: true },
    });
    //also send mail to user about ticket completion
    if (status === "COMPLETED") { 
      setImmediate(async () => {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          await resend.emails.send({
            from: "NADRA System <onboarding@resend.dev>",
            to: updated.user.email,
            subject: `Ticket #${updated.id} Completed`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #047857;">✅ Ticket Completed</h2>
                <p>Great news! Your ticket has been completed.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Ticket ID:</strong> #${updated.id}</p>
                  <p><strong>Service:</strong> ${updated.service.name}</p>
                  <p><strong>Status:</strong> Completed</p>
                  ${updated.agent ? `<p><strong>Handled by:</strong> ${updated.agent.name}</p>` : ""}
                </div>
                <p>Thank you for using NADRA Citizen Portal!</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("EMAIL FAILED:", emailErr);
        }
      });
    }

    // If not completed → return immediately
    if (status !== "COMPLETED") {
      return NextResponse.json({ success: true, ticket: updated });
    }
    //updated payment status
    await prisma.payment.updateMany({
      where: { ticketId: ticketId },
      data: { status: "COMPLETED" },
    });
    // AUTO-ASSIGN NEXT TICKET
    const autoAssigned = await prisma.$transaction(async (tx) => {
      const agentId = updated.agentId;
      if (!agentId) return null;

      const agent = await tx.agent.findUnique({ where: { id: agentId } });
      if (!agent) return null;

      // HOW MANY TICKETS ALREADY ACTIVE
      const activeCount = await tx.ticket.count({
        where: {
          agentId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      });

      if (activeCount >= agent.maxTickets) return null;

      // PICK HIGHEST PRIORITY WAITING TICKET
      const nextTicket = await tx.ticket.findFirst({
        where: { agentId: null, status: "OPEN" },
        orderBy: [
          { finalPriority: "desc" }, // FIXED
          { createdAt: "asc" }
        ],
        include: { user: true, service: true },
      });

      if (!nextTicket) return null;

      // ASSIGN
      const assigned = await tx.ticket.update({
        where: { id: nextTicket.id },
        data: {
          agentId,
          status: "IN_PROGRESS",
        },
        include: { user: true, service: true },
      });

      await tx.ticketLog.create({
        data: {
          ticketId: assigned.id,
          message: `Auto-assigned to Agent ${agent.name}`,
        },
      });

      return assigned;
    });

    // SEND EMAIL (but DO NOT FAIL API if email fails)
    if (autoAssigned) {
      setImmediate(async () => {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: "NADRA System <onboarding@resend.dev>",
            to: autoAssigned.user.email,
            subject: `Ticket #${autoAssigned.id} Assigned`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #047857;">Ticket Assigned</h2>
                <p>Your ticket for <strong>${autoAssigned.service.name}</strong> has been assigned to ${updated.agent.name}.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Ticket ID:</strong> #${autoAssigned.id}</p>
                  <p><strong>Status:</strong> In Progress</p>
                  <p><strong>Agent:</strong> ${updated.agent.name}</p>
                </div>
                <p>We will keep you updated on your ticket progress.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("EMAIL FAILED:", emailErr);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updated,
      autoAssigned,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json({ success: false, error: "Update failed (server error)" });
  }
}


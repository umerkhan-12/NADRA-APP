

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

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
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        }); 
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: updated.user.email,
          subject: `Ticket #${updated.id} Completed`,
          text: `Your ticket for ${updated.service.name} has been marked as COMPLETED. Thank you!`,
        });
      } catch (emailErr) {
        console.error("EMAIL FAILED:", emailErr);
      } 
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
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: autoAssigned.user.email,
          subject: `Ticket #${autoAssigned.id} Assigned`,
          text: `Your ticket for ${autoAssigned.service.name} is now assigned to agent ${updated.agent.name}.`,
        });
      } catch (emailErr) {
        console.error("EMAIL FAILED:", emailErr);
      }
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


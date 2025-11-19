// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import nodemailer from "nodemailer";

// function priorityToNumber(priority) {
//   if (priority === "HIGH" || priority === "URGENT") return 3;
//   if (priority === "MEDIUM") return 2;
//   if (priority === "LOW" || priority === "NORMAL") return 1;
//   return 1;
// }

// // Helper: find available agent
// // Helper: find available agent with max 5 pending tickets
// async function assignAgent(finalPriority) {
//   const agents = await prisma.agent.findMany();
//   if (!agents || agents.length === 0) return null;

//   const agentTicketCounts = await Promise.all(
//     agents.map(async (agent) => {
//       const count = await prisma.ticket.count({
//         where: { agentId: agent.id, status: { not: "COMPLETED" } },
//       });
//       return { agent, count };
//     })
//   );

//   // Filter agents with less than 5 pending tickets
//   const availableAgents = agentTicketCounts.filter((a) => a.count < 5);

//   if (availableAgents.length === 0) return null;

//   // Sort available agents by least tickets first
//   availableAgents.sort((a, b) => a.count - b.count);

//   return availableAgents[0].agent;
// }


// export async function POST(req) {
//   try {
//     const { serviceId, customerPriority, userId } = await req.json();

//     const numericuserId = parseInt(userId, 10);
//     const numericServiceId = parseInt(serviceId, 10);

//     if (!numericuserId || !numericServiceId || !customerPriority) {
//       return NextResponse.json(
//         { success: false, error: "Invalid userId, serviceId or priority" },
//         { status: 400 }
//       );
//     }

//     // Fetch service
//     const service = await prisma.service.findUnique({
//       where: { id: numericServiceId },
//     });

//     if (!service)
//       return NextResponse.json({ success: false, error: "Service not found" });

//     // Final priority calculation
//     const finalPriority = Math.min(
//       3,
//       Math.max(
//         1,
//         priorityToNumber(service.defaultPriority || "NORMAL") +
//           priorityToNumber(customerPriority)
//       )
//     );

//     // Assign agent based on availability
//     const agent = await assignAgent(finalPriority);

//     // Create ticket
//     const ticket = await prisma.ticket.create({
//       data: {
//         userId: numericuserId,
//         serviceId: numericServiceId,
//         servicePriority: service.defaultPriority || "NORMAL",
//         customerPriority,
//         finalPriority,
//         status: agent ? "IN_PROGRESS" : "OPEN",
//         agentId: agent?.id || null,
//       },
//       include: {
//         user: true,
//         service: true,
//         agent: true,
//       },
//     });

//     // Create LOG
//     await prisma.ticketLog.create({
//       data: {
//         ticketId: ticket.id,
//         message: agent
//           ? `Ticket created with priority ${customerPriority} and assigned to agent ${agent.name}`
//           : `Ticket created with priority ${customerPriority} (no agent available — waiting)`,
//       },
//     });

//     // Create payment
//     await prisma.payment.create({
//       data: {
//         userId: numericuserId,
//         ticketId: ticket.id,
//         amount: service.fee || service.price || 0,
//         status: "PENDING",
//       },
//     });

//     // -----------------------------
//     // EMAIL USER ABOUT TICKET
//     // -----------------------------
//     try {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: ticket.user.email,
//         subject: `Your Ticket #${ticket.id} is Created`,
//         html: `
//           <h3>NADRA Service Ticket Created</h3>
//           <p><strong>Service:</strong> ${ticket.service.name}</p>
//           <p><strong>Priority:</strong> ${customerPriority}</p>
//           <p><strong>Status:</strong> ${agent ? "Assigned" : "Waiting"}</p>
//           ${agent ? `<p><strong>Assigned Agent:</strong> ${agent.name}</p>` : ""}
//           <hr/>
//           <p>We will notify you when your status changes.</p>
//         `,
//       });
//     } catch (emailErr) {
//       console.error("Email failed:", emailErr);
//     }

//     return NextResponse.json({ success: true, ticket });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: err.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
// app/api/tickets/route.js
import { NextResponse } from "next/server";
import { createTicket } from "@/lib/ticketHelper";

export async function POST(req) {
  try {
    const { serviceId, customerPriority, userId } = await req.json();

    if (!serviceId || !customerPriority || !userId) {
      return NextResponse.json(
        { success: false, error: "Invalid userId, serviceId or priority" },
        { status: 400 }
      );
    }

    // Use the helper to create ticket
    const ticket = await createTicket({ serviceId, customerPriority, userId });

    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    console.error("TICKET CREATE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

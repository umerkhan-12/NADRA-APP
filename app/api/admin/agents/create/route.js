// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// export async function POST(req) {
//   try {
//     const { name, email, username, password } = await req.json();

//     // Validate input
//     if (!name || !email || !username || !password) {
//       return NextResponse.json({ success: false, error: "All fields are required." });
//     }

//     // Check if email already exists
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return NextResponse.json({ success: false, error: "Email already in use." });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create agent
//     const newAgent = await prisma.agent.create({
//       data: {
//         name,
//         email,
//         username,
//         password: hashedPassword,
//       },
//     });

//     return NextResponse.json({ success: true, agent: newAgent });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ success: false, error: err.message });
//   }
// }
// app/api/admin/agents/create/route.js
// app/api/admin/agents/create/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, username, password, maxTickets } = await req.json();

    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }
    // Check if email or username already exists
    const existingAgent = await prisma.agent.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: "Email or Username already in use" },
        { status: 400 }
      );
    }
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Create new agent
    const agent = await prisma.agent.create({
      data: { name, email, username, password: hashedPassword, maxTickets: maxTickets || 5 },
    });

    // 2️⃣ Fetch OPEN tickets not assigned to any agent
    const openTickets = await prisma.ticket.findMany({
      where: { agentId: null, status: "OPEN" },
      orderBy: [
        { finalPriority: "desc" },
        { createdAt: "asc" },
      ],
    });

    // 3️⃣ Assign tickets up to agent.maxTickets
    const assignCount = Math.min(openTickets.length, agent.maxTickets || 5);
    const assignedTickets = [];

    for (let i = 0; i < assignCount; i++) {
      const ticket = await prisma.ticket.update({
        where: { id: openTickets[i].id },
        data: { agentId: agent.id, status: "IN_PROGRESS" },
        include: { user: true, service: true },
      });

      // Log assignment
      await prisma.ticketLog.create({
        data: { ticketId: ticket.id, message: `Auto-assigned to Agent ${agent.name}` },
      });

      // Email user
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
          to: ticket.user.email,
          subject: `Ticket #${ticket.id} Assigned`,
          html: `<p>Your ticket for ${ticket.service.name} is now assigned to agent ${agent.name}.</p>`,
        });
      } catch (err) {
        console.error("Email failed:", err);
      }

      assignedTickets.push(ticket);
    }

    return NextResponse.json({ success: true, agent, assignedTickets });
  } catch (err) {
    console.error("AGENT CREATE ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

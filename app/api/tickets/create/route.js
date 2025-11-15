// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// // Converts priority string to numeric value
// function priorityToNumber(priority) {
//   if (priority === "HIGH") return 3;
//   if (priority === "MEDIUM") return 2;
//   if (priority === "LOW") return 1;
//   if (priority === "URGENT") return 3;
//   return 1; // default
// }

// export async function POST(req) {
//   try {
//     const { serviceId, customerPriority, userId } = await req.json();

//     // Validate userId
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, error: "Missing userId" },
//         { status: 400 }
//       );
//     }

//     // Validate serviceId and priority
//     if (!serviceId || !customerPriority) {
//       return NextResponse.json(
//         { success: false, error: "Missing serviceId or priority" },
//         { status: 400 }
//       );
//     }

//     // Check if service exists
//     const service = await prisma.service.findUnique({
//       where: { id: parseInt(serviceId) },
//     });

//     if (!service) {
//       return NextResponse.json({ success: false, error: "Invalid service" });
//     }

//     const servicePriority = service.defaultPriority;

//     // Calculate final priority (1=LOW, 3=HIGH)
//     const finalPriority = Math.min(
//       3,
//       Math.max(1, priorityToNumber(servicePriority) + priorityToNumber(customerPriority))
//     );

//     // Optional: assign an agent (if you want, otherwise leave null)
//     // const agent = await prisma.agent.findFirst({
//     //   where: { tickets: { _count: { lt: 5 } } },
//     //   orderBy: { tickets: { _count: "asc" } },
//     // });

//     // Create the ticket
//     const ticket = await prisma.ticket.create({
//       data: {
//         userId,
//         serviceId: parseInt(serviceId),
//         // agentId: agent?.id || null,
//         servicePriority,
//         customerPriority,
//         finalPriority,
//       },
//     });

//     // Log ticket creation
//     await prisma.ticketLog.create({
//       data: {
//         ticketId: ticket.id,
//         message: `Ticket created with priority ${customerPriority}`,
//       },
//     });
//     await prisma.payment.create({
//       data: {
//         userId,
//         ticketId: ticket.id,
//         amount: service.fee, // Use fee from service table
//         status: "PENDING",
//       },
//     });

//     return NextResponse.json({ success: true, ticket });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: err.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
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

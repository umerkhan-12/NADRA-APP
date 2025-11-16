import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalTickets = await prisma.ticket.count();
    const pendingPayments = await prisma.payment.count({
      where: { status: "PENDING" },
    });
    const completedTickets = await prisma.ticket.count({
      where: { status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalTickets,
        pendingPayments,
        completedTickets,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

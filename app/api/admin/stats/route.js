import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authCheck";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const [totalUsers, totalTickets, pendingPayments, completedTickets, totalAgents] = await Promise.all([
      prisma.user.count(),
      prisma.ticket.count(),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.ticket.count({ where: { status: "COMPLETED" } }),
      prisma.agent.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalTickets,
        pendingPayments,
        completedTickets,
        totalAgents,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

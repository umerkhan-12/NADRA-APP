import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authCheck";

export async function GET(request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "50"));
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } },
          payment: { select: { id: true, status: true } },
          delivery: { select: { id: true, status: true } },
        },
        orderBy: { id: "desc" },
        take: limit,
        skip,
      }),
      prisma.ticket.count(),
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

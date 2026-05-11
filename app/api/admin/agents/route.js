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

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { id: "desc" },
        take: limit,
        skip,
      }),
      prisma.agent.count(),
    ]);

    return NextResponse.json({
      agents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { agents: [], error: err.message },
      { status: 500 }
    );
  }
}



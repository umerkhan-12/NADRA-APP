import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { page } = await req.json();
    
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.visitorCount.create({
      data: {
        ipAddress,
        userAgent,
        page: page || "home",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Run all queries in parallel for speed
    const [totalVisitors, uniqueResult, todayVisitors, weekVisitors, pageVisits] = await Promise.all([
      prisma.visitorCount.count(),
      // Use raw query for COUNT(DISTINCT) — much faster than groupBy loading all records
      prisma.$queryRaw`SELECT COUNT(DISTINCT ipAddress) as count FROM VisitorCount`,
      prisma.visitorCount.count({
        where: { visitedAt: { gte: today } },
      }),
      prisma.visitorCount.count({
        where: { visitedAt: { gte: weekAgo } },
      }),
      prisma.visitorCount.groupBy({
        by: ['page'],
        _count: true,
        orderBy: { _count: { page: 'desc' } },
      }),
    ]);

    return NextResponse.json({
      totalVisitors,
      uniqueVisitors: Number(uniqueResult[0]?.count || 0),
      todayVisitors,
      weekVisitors,
      pageVisits,
    });
  } catch (error) {
    console.error("Get visitor stats error:", error);
    return NextResponse.json({ error: "Failed to get statistics" }, { status: 500 });
  }
}

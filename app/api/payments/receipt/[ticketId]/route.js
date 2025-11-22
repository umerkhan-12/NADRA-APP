import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const ticketId = parseInt(params.ticketId, 10);

    if (!ticketId) {
      return NextResponse.json(
        { error: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    // Fetch payment with all related data
    const payment = await prisma.payment.findUnique({
      where: { ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cnic: true,
          },
        },
        ticket: {
          include: {
            service: true,
            agent: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      receipt: payment,
    });
  } catch (error) {
    console.error("Receipt fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

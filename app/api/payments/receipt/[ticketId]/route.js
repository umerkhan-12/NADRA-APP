import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const ticketId = parseInt(params.ticketId, 10);

    console.log("Receipt API - Fetching for ticket ID:", ticketId); // Debug log

    if (!ticketId || isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ticket ID" },
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

    console.log("Payment found:", payment ? "Yes" : "No"); // Debug log

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Receipt not found for this ticket" },
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
      { success: false, error: error.message || "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

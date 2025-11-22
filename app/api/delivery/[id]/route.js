import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const deliveryId = parseInt(params.id);

    if (!deliveryId) {
      return NextResponse.json(
        { error: "Delivery ID is required" },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        ticket: {
          include: {
            user: true,
            service: true
          }
        }
      }
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      delivery
    });
  } catch (error) {
    console.error("Fetch delivery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Create delivery details for a ticket
export async function POST(request, context) {
  try {
    const { id } = await context.params;
    const ticketId = parseInt(id, 10);

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Check if delivery already exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { ticketId: ticketId },
    });

    if (existingDelivery) {
      return NextResponse.json(
        { success: false, error: "Delivery details already exist for this ticket" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { address, city, phone } = body;

    // Validate required fields
    if (!address || !city || !phone) {
      return NextResponse.json(
        { success: false, error: "Address, city, and phone are required" },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        ticketId: ticketId,
        address: address,
        city: city,
        phone: phone,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      delivery: delivery,
      message: "Delivery details added successfully",
    });
  } catch (error) {
    console.error("Create delivery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create delivery details" },
      { status: 500 }
    );
  }
}

// GET - Fetch delivery details for a ticket
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const ticketId = parseInt(id, 10);

    const delivery = await prisma.delivery.findUnique({
      where: { ticketId: ticketId },
    });

    if (!delivery) {
      return NextResponse.json({
        success: true,
        delivery: null,
        message: "No delivery details found",
      });
    }

    return NextResponse.json({
      success: true,
      delivery: delivery,
    });
  } catch (error) {
    console.error("Fetch delivery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch delivery details" },
      { status: 500 }
    );
  }
}

// PATCH - Update delivery status
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const ticketId = parseInt(id, 10);

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Update delivery status
    const delivery = await prisma.delivery.update({
      where: { ticketId: ticketId },
      data: { status: status },
    });

    return NextResponse.json({
      success: true,
      delivery: delivery,
      message: "Delivery status updated successfully",
    });
  } catch (error) {
    console.error("Update delivery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}

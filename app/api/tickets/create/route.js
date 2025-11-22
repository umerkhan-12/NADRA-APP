
import { NextResponse } from "next/server";
import { createTicket } from "@/lib/ticketHelper";

export async function POST(req) {
  try {
    const { serviceId, customerPriority, userId } = await req.json();

    if (!serviceId || !customerPriority || !userId) {
      return NextResponse.json(
        { success: false, error: "Invalid userId, serviceId or priority" },
        { status: 400 }
      );
    }

    // Use the helper to create ticket
    const ticket = await createTicket({ serviceId, customerPriority, userId });

    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    console.error("TICKET CREATE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

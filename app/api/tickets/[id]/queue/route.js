import { NextResponse } from "next/server";
import { getQueueInfo } from "@/lib/queueHelper";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const ticketId = params.id;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const queueInfo = await getQueueInfo(ticketId);

    if (queueInfo.error) {
      return NextResponse.json(
        { error: queueInfo.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      queue: queueInfo
    });
  } catch (error) {
    console.error("Queue position API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue position" },
      { status: 500 }
    );
  }
}

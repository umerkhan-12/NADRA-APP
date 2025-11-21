import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    const serviceId = parseInt(id, 10);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid service ID" },
        { status: 400 }
      );
    }

    // Fetch required documents for the service
    const documents = await prisma.requiredDocument.findMany({
      where: { serviceId },
      orderBy: [
        { isMandatory: 'desc' }, // Show mandatory documents first
        { documentName: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching required documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch required documents" },
      { status: 500 }
    );
  }
}

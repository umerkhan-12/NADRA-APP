import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF, JPG, PNG, DOC, and DOCX files are allowed",
        },
        { status: 400 }
      );
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `ticket_${ticketId}_${timestamp}${fileExtension}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    // Save file to public/uploads
    await writeFile(filePath, buffer);

    // Save document info to database
    const document = await prisma.uploadedDocument.create({
      data: {
        ticketId: ticketId,
        filePath: `/uploads/${fileName}`,
        fileType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      document: document,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// GET - Fetch all documents for a ticket
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const ticketId = parseInt(id, 10);

    const documents = await prisma.uploadedDocument.findMany({
      where: { ticketId: ticketId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      documents: documents,
    });
  } catch (error) {
    console.error("Fetch documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

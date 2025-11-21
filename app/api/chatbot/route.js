import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000";

export async function POST(request) {
  let language = "en"; // Default language
  
  try {
    const { message, language: reqLanguage = "en", userId, isDashboard = false } = await request.json();
    language = reqLanguage; // Update language from request

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // If from dashboard and user is logged in, fetch their tickets for context
    let userContext = "";
    if (isDashboard && userId) {
      try {
        const tickets = await prisma.ticket.findMany({
          where: { userId: parseInt(userId) },
          include: {
            service: true,
            agent: true,
            payment: true,
            delivery: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        if (tickets.length > 0) {
          userContext = `\n\nUser's Recent Tickets:\n`;
          tickets.forEach(t => {
            userContext += `- Ticket #${t.id}: ${t.service.name} (${t.status})`;
            if (t.agent) userContext += ` | Agent: ${t.agent.name}`;
            if (t.payment) userContext += ` | Payment: ${t.payment.status}`;
            if (t.delivery) userContext += ` | Delivery: ${t.delivery.status}`;
            userContext += `\n`;
          });
        }
      } catch (err) {
        console.error("Error fetching user tickets:", err);
      }
    }

    // Call Flask chatbot API
    const response = await fetch(`${FLASK_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: message + userContext, 
        language, 
        userId,
        isDashboard 
      }),
    });

    if (!response.ok) {
      throw new Error("Flask API error");
    }

    const data = await response.json();

    // Log the conversation to database
    if (userId || data.response) {
      await prisma.chatbotLog.create({
        data: {
          userId: userId ? parseInt(userId, 10) : null,
          question: message,
          response: data.response,
        },
      });
    }

    return NextResponse.json({
      success: true,
      response: data.response,
      language: data.language,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    
    // Fallback response if Flask is down
    const fallbackMessage = language === "ur" 
      ? "معذرت، چیٹ بوٹ فی الوقت دستیاب نہیں ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں یا ہماری سپورٹ ٹیم سے رابطہ کریں۔"
      : "Sorry, the chatbot is currently unavailable. Please try again later or contact our support team.";
    
    return NextResponse.json({
      success: false,
      response: fallbackMessage,
      error: error.message,
    }, { status: 500 });
  }
}

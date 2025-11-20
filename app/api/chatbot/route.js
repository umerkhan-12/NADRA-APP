import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000";

export async function POST(request) {
  let language = "en"; // Default language
  
  try {
    const { message, language: reqLanguage = "en", userId } = await request.json();
    language = reqLanguage; // Update language from request

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call Flask chatbot API
    const response = await fetch(`${FLASK_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, language, userId }),
    });

    if (!response.ok) {
      throw new Error("Flask API error");
    }

    const data = await response.json();

    // Log the conversation to database
    if (userId || data.response) {
      await prisma.chatbotLog.create({
        data: {
          userId: userId || null,
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

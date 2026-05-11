import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { queueEmail } from "@/lib/jobQueue";

export async function POST(req) {
  try {
    const { ticketId, paymentMethod, cardDetails } = await req.json();

    if (!ticketId || !paymentMethod) {
      return NextResponse.json(
        { error: "Ticket ID and payment method are required" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["ONLINE", "CASH_ON_DELIVERY"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // If online payment, validate card details
    if (paymentMethod === "ONLINE") {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cvv || !cardDetails.expiryDate) {
        return NextResponse.json(
          { error: "Card details are required for online payment" },
          { status: 400 }
        );
      }

      // Simulate card validation (accept any format for testing)
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, "");
      if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        return NextResponse.json(
          { error: "Card number must be 16 digits" },
          { status: 400 }
        );
      }

      if (cardDetails.cvv.length !== 3 || !/^\d+$/.test(cardDetails.cvv)) {
        return NextResponse.json(
          { error: "CVV must be 3 digits" },
          { status: 400 }
        );
      }

      if (cardDetails.expiryDate.length !== 4 || !/^\d+$/.test(cardDetails.expiryDate)) {
        return NextResponse.json(
          { error: "Expiry date must be in MMYY format" },
          { status: 400 }
        );
      }
    }

    // ✅ USE TRANSACTION for idempotency protection
    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Fetch payment record within transaction
      const payment = await tx.payment.findUnique({
        where: { ticketId: parseInt(ticketId) },
        include: {
          user: true,
          ticket: {
            include: {
              service: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // ✅ IDEMPOTENCY CHECK - Prevent double payment
      if (payment.status === "COMPLETED") {
        throw new Error("Payment already completed");
      }

      // Simulate payment processing delay (outside transaction for better performance)
      // In production, this would be an external API call
      // For now, we'll do it before the transaction

      // Update payment based on method
      return await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentMethod === "ONLINE" ? "COMPLETED" : "PENDING",
          paymentMethod: paymentMethod,
          transactionId:
            paymentMethod === "ONLINE"
              ? `TXN${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`
              : null,
          paidAt: paymentMethod === "ONLINE" ? new Date() : null,
        },
        include: {
          user: true,
          ticket: {
            include: {
              service: true,
            },
          },
        },
      });
    });


    // Queue confirmation email (non-blocking)
    queueEmail({
      to: updatedPayment.user.email,
      subject:
        paymentMethod === "ONLINE"
          ? `Payment Confirmed - Ticket #${ticketId}`
          : `Payment Pending (COD) - Ticket #${ticketId}`,
      html:
        paymentMethod === "ONLINE"
          ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #047857;">✅ Payment Successful</h2>
            <p>Dear ${updatedPayment.user.name},</p>
            <p>Your payment has been successfully processed.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Transaction ID:</strong> ${updatedPayment.transactionId}</p>
              <p><strong>Ticket ID:</strong> #${ticketId}</p>
              <p><strong>Service:</strong> ${updatedPayment.ticket.service.name}</p>
              <p><strong>Amount:</strong> Rs. ${updatedPayment.amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> Online Card Payment</p>
              <p><strong>Status:</strong> Completed</p>
            </div>
            <p>Your ticket is now being processed.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
          </div>
        `
          : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563EB;">📦 Cash on Delivery Selected</h2>
            <p>Dear ${updatedPayment.user.name},</p>
            <p>You have selected Cash on Delivery for your service.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket ID:</strong> #${ticketId}</p>
              <p><strong>Service:</strong> ${updatedPayment.ticket.service.name}</p>
              <p><strong>Amount to Pay:</strong> Rs. ${updatedPayment.amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> Cash on Delivery</p>
              <p><strong>Status:</strong> Pending (Pay when you receive documents)</p>
            </div>
            <p><strong>Important:</strong> Please keep the exact amount ready when our delivery agent arrives.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
          </div>
        `,
    }).catch((err) => console.error("Failed to queue email:", err.message));

    return NextResponse.json({
      success: true,
      message:
        paymentMethod === "ONLINE"
          ? "Payment completed successfully"
          : "Cash on Delivery selected. Pay when you receive your documents.",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    
    // ✅ Better error handling for idempotency errors
    if (error.message === "Payment already completed") {
      return NextResponse.json(
        { error: "Payment already completed for this ticket" },
        { status: 409 } // Conflict status code
      );
    }
    
    if (error.message === "Payment record not found") {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: 500 }
    );
  }
}

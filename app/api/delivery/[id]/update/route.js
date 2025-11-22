import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function PATCH(req, context) {
  try {
    const params = await context.params;
    const deliveryId = parseInt(params.id);
    const body = await req.json();

    const { status, agentName, agentPhone, trackingNumber, estimatedDelivery, notes } = body;

    if (!deliveryId) {
      return NextResponse.json(
        { error: "Delivery ID is required" },
        { status: 400 }
      );
    }

    // Fetch existing delivery
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

    // Prepare update data
    const updateData = {};
    
    if (status) updateData.status = status;
    if (agentName) updateData.agentName = agentName;
    if (agentPhone) updateData.agentPhone = agentPhone;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (notes !== undefined) updateData.notes = notes;

    // Set actual delivery date if status is DELIVERED
    if (status === "DELIVERED" && !delivery.actualDelivery) {
      updateData.actualDelivery = new Date();
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: {
        ticket: {
          include: {
            user: true,
            service: true
          }
        }
      }
    });

    // Send email notification for status changes
    if (status && status !== delivery.status) {
      setImmediate(async () => {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          let emailSubject = "";
          let emailContent = "";

          switch (status) {
            case "DISPATCHED":
              emailSubject = `📦 Your Order Has Been Dispatched - Ticket #${delivery.ticket.id}`;
              emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #047857;">📦 Order Dispatched!</h2>
                  <p>Dear ${delivery.ticket.user.name},</p>
                  <p>Great news! Your document order has been dispatched and is on its way to you.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Ticket ID:</strong> #${delivery.ticket.id}</p>
                    <p><strong>Service:</strong> ${delivery.ticket.service.name}</p>
                    ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
                    ${agentName ? `<p><strong>Delivery Agent:</strong> ${agentName}</p>` : ''}
                    ${agentPhone ? `<p><strong>Agent Contact:</strong> ${agentPhone}</p>` : ''}
                    ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</p>` : ''}
                    <p><strong>Delivery Address:</strong> ${delivery.address}, ${delivery.city}</p>
                  </div>
                  <p>Your documents will arrive soon. Our delivery agent will contact you shortly.</p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
                </div>
              `;
              break;

            case "IN_TRANSIT":
              emailSubject = `🚚 Your Order Is Out for Delivery - Ticket #${delivery.ticket.id}`;
              emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563EB;">🚚 Out for Delivery!</h2>
                  <p>Dear ${delivery.ticket.user.name},</p>
                  <p>Your document order is now out for delivery and will reach you soon.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Ticket ID:</strong> #${delivery.ticket.id}</p>
                    ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
                    ${agentName ? `<p><strong>Delivery Agent:</strong> ${agentName}</p>` : ''}
                    ${agentPhone ? `<p><strong>Agent Contact:</strong> ${agentPhone}</p>` : ''}
                    <p><strong>Delivery Address:</strong> ${delivery.address}, ${delivery.city}</p>
                  </div>
                  <p><strong>Please keep the payment ready if you selected Cash on Delivery.</strong></p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
                </div>
              `;
              break;

            case "DELIVERED":
              emailSubject = `✅ Your Order Has Been Delivered - Ticket #${delivery.ticket.id}`;
              emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #059669;">✅ Order Delivered Successfully!</h2>
                  <p>Dear ${delivery.ticket.user.name},</p>
                  <p>Your document order has been successfully delivered.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Ticket ID:</strong> #${delivery.ticket.id}</p>
                    <p><strong>Service:</strong> ${delivery.ticket.service.name}</p>
                    <p><strong>Delivered At:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Delivery Address:</strong> ${delivery.address}, ${delivery.city}</p>
                  </div>
                  <p>Thank you for using NADRA services. We hope we served you well!</p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
                </div>
              `;
              break;
          }

          if (emailSubject && emailContent) {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: delivery.ticket.user.email,
              subject: emailSubject,
              html: emailContent,
            });
          }
        } catch (emailErr) {
          console.error("Delivery notification email failed:", emailErr);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Delivery updated successfully",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error("Delivery update error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
}

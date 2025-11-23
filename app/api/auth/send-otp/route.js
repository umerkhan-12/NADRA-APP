// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import nodemailer from "nodemailer";

// export async function POST(req) {
//   try {
//     const { email } = await req.json();

//      // Check if user already exists
//     const existingUser = await prisma.user.findFirst({
//       where: { email },
//     });

//     if (existingUser) {
//       return NextResponse.json({
//         success: false,
//         error: "This email is already registered. Please login.",
//         // I WANT TO REDIRECT TO LOGIN PAGEafter this shown up do it 
//         // correct it 
       
//       });
//     }

//     const code = Math.floor(100000 + Math.random() * 900000).toString();

//     await prisma.OTP.create({
//       data: { email, code }
//     });

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"NADRA Services" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP Code is: ${code}`,
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json({ success: false, error: err.message });
//   }
// }
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json({
        success: false,
        error: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "This email is already registered. Please login.",
        redirect: "/login",
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTPs for this email
    await prisma.OTP.deleteMany({ where: { email } });

    // Store user data in metaData field for later use
    const metaData = JSON.stringify({
      name,
      email,
      phone: phone || null,
      password, // Will be hashed during verification
    });

    // Create new OTP with expiration
    await prisma.OTP.create({
      data: { 
        email, 
        code,
        expireat: expireAt,
        metaData
      },
    });

    // Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP Email
    await transporter.sendMail({
      from: `"NADRA Citizen Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "NADRA Account Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3c72;">NADRA Account Verification</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; color: #1e3c72; font-weight: bold; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from NADRA Citizen Portal.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true,
      message: "OTP sent successfully to your email"
    });
  } catch (err) {
    console.error("OTP Email Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to send OTP. Please try again."
    });
  }
}

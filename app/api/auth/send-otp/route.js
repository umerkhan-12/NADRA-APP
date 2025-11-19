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
    const { email } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "This email is already registered. Please login.",
        redirect: "/login", // <-- FRONTEND WILL HANDLE THIS
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.OTP.create({
      data: { email, code },
    });

    // Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // <-- MUST MATCH YOUR .env
        pass: process.env.EMAIL_PASS,  // <-- APP PASSWORD ONLY
      },
    });

    // Send OTP Email
    await transporter.sendMail({
      from: `"NADRA Services" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p style="font-size: 18px; letter-spacing: 2px;"><strong>${code}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OTP Email Error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

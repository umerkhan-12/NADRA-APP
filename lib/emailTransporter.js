/**
 * Reusable Nodemailer Transporter
 * Creates one transporter instance and reuses it across all email sends.
 * This avoids establishing a new SMTP connection for every email.
 */
import nodemailer from "nodemailer";

let transporter = null;

export function getEmailTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
}

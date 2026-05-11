/**
 * Bull Job Queue Configuration
 * Handles async email delivery with retries and monitoring
 */

import { Queue, Worker } from "bullmq";
import Redis from "redis";
import { getEmailTransporter } from "@/lib/emailTransporter";

// Redis connection (shared instance)
let redisClient;
let emailQueue;
let emailWorker;
let queueDisabled = false;

function isQueueEnabled() {
  return process.env.BULL_QUEUE_ENABLED !== "false" && !!process.env.REDIS_URL;
}

function disableQueue(reason) {
  if (!queueDisabled) {
    console.warn(`⚠️  Email queue disabled. ${reason}`);
  }
  queueDisabled = true;
}

/**
 * Initialize Redis connection
 */
function getRedisConnection() {
  if (redisClient) return redisClient;
  if (!isQueueEnabled()) return null;

  try {
    const redisUrl = process.env.REDIS_URL;
    redisClient = new Redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    redisClient.on("connect", () => console.log("✓ Redis connected"));

    return redisClient;
  } catch (err) {
    console.error("Failed to connect to Redis:", err.message);
    return null;
  }
}

/**
 * Initialize email queue
 */
export async function initEmailQueue() {
  if (emailQueue && emailWorker) {
    return emailQueue;
  }
  if (queueDisabled) return null;

  if (!isQueueEnabled()) {
    disableQueue("Set REDIS_URL to enable async email processing.");
    return null;
  }

  try {
    const connection = getRedisConnection();
    if (!connection) {
      disableQueue("Redis not available. Emails will be sent synchronously.");
      return null;
    }

    const queueName = process.env.JOB_QUEUE_NAME || "nadra-emails";

    // Create queue
    emailQueue = new Queue(queueName, {
      connection: {
        host: process.env.REDIS_URL?.split("//")[1]?.split(":")[0] || "localhost",
        port: parseInt(process.env.REDIS_URL?.split(":")[2]) || 6379,
      },
    });

    // Setup event listeners
    emailQueue.on("error", (err) => console.error("Queue error:", err));
    emailQueue.on("completed", (job) =>
      console.log(`✓ Email job ${job.id} completed`)
    );
    emailQueue.on("failed", (job, err) =>
      console.error(`✗ Email job ${job.id} failed:`, err.message)
    );

    // Start worker
    emailWorker = new Worker(queueName, processEmailJob, {
      connection: {
        host: process.env.REDIS_URL?.split("//")[1]?.split(":")[0] || "localhost",
        port: parseInt(process.env.REDIS_URL?.split(":")[2]) || 6379,
      },
      concurrency: 5, // Process 5 emails in parallel
    });

    emailWorker.on("error", (err) => console.error("Worker error:", err));
    emailWorker.on("completed", (job) =>
      console.log(`✓ Worker processed job ${job.id}`)
    );

    console.log(`✓ Email queue initialized (${queueName})`);
    return emailQueue;
  } catch (err) {
    console.error("Failed to initialize email queue:", err.message);
    return null;
  }
}

/**
 * Process email job (worker)
 */
async function processEmailJob(job) {
  const { to, subject, html, from } = job.data;

  try {
    const transporter = getEmailTransporter();

    const result = await transporter.sendMail({
      from: from || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Email job ${job.id} failed:`, error.message);
    throw error; // Will be retried
  }
}

/**
 * Add email to queue
 * Non-blocking: returns immediately
 */
export async function queueEmail(emailData) {
  // If queue not available, send synchronously
  if (!emailQueue || queueDisabled) {
    return sendEmailSync(emailData);
  }

  try {
    const job = await emailQueue.add("send-email", emailData, {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: "exponential",
        delay: 2000, // 2 seconds initial delay
      },
      removeOnComplete: true,
    });

    console.log(`📧 Email queued (Job ID: ${job.id})`);
    return { queued: true, jobId: job.id };
  } catch (err) {
    console.error("Failed to queue email:", err.message);
    // Fallback to sync sending
    return sendEmailSync(emailData);
  }
}

/**
 * Fallback: Send email synchronously
 */
async function sendEmailSync(emailData) {
  try {
    const { to, subject, html, from } = emailData;
    const transporter = getEmailTransporter();

    const result = await transporter.sendMail({
      from: from || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log(`✓ Email sent synchronously (Message ID: ${result.messageId})`);
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    console.error("Synchronous email send failed:", err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Get queue statistics (for monitoring)
 */
export async function getQueueStats() {
  if (!emailQueue) {
    return { available: false, message: "Queue not initialized" };
  }

  try {
    const counts = await emailQueue.getJobCounts();
    return {
      available: true,
      jobs: counts,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to get queue stats:", err.message);
    return { available: false, error: err.message };
  }
}

/**
 * Close queue and worker
 */
export async function closeQueue() {
  try {
    if (emailWorker) await emailWorker.close();
    if (emailQueue) await emailQueue.close();
    if (redisClient) await redisClient.quit();
    console.log("✓ Job queue closed");
  } catch (err) {
    console.error("Error closing queue:", err.message);
  }
}

// Auto-initialize on module load in Next.js
if (typeof window === "undefined" && isQueueEnabled()) {
  // Server-side only
  setTimeout(() => initEmailQueue(), 1000);
}

const jobQueueApi = {
  initEmailQueue,
  queueEmail,
  getQueueStats,
  closeQueue,
};

export default jobQueueApi;

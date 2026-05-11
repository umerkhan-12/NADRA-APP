import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getQueueStats, initEmailQueue } from "@/lib/jobQueue";

function findLatestReport(prefix) {
  const cwd = process.cwd();
  const files = fs
    .readdirSync(cwd)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".json"));

  if (files.length === 0) return null;

  const latest = files
    .map((file) => ({
      file,
      mtime: fs.statSync(path.join(cwd, file)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime)[0];

  return path.join(cwd, latest.file);
}

function loadReport(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error("Failed to parse report:", error.message);
    return null;
  }
}

import { requireAdmin } from "@/lib/authCheck";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const queueEnabled =
      process.env.BULL_QUEUE_ENABLED !== "false" && !!process.env.REDIS_URL;

    let queueStats = {
      available: false,
      enabled: queueEnabled,
      message: queueEnabled
        ? "Queue not initialized"
        : "Queue disabled (set REDIS_URL to enable)",
    };

    if (queueEnabled) {
      try {
        await initEmailQueue();
        queueStats = {
          ...(await getQueueStats()),
          enabled: queueEnabled,
        };
      } catch (error) {
        queueStats = {
          available: false,
          enabled: queueEnabled,
          error: error.message,
        };
      }
    }

    const indexPath = findLatestReport("index-analysis-");
    const indexReport = loadReport(indexPath);
    const indexStats = indexReport
      ? {
          available: true,
          generatedAt: indexReport.generatedAt,
          totals: indexReport.totals,
          file: path.basename(indexPath),
        }
      : {
          available: false,
          message: "Run: node scripts/analyzeIndexes.js",
        };

    const benchmarkPath = findLatestReport("query-benchmark-");
    const benchmarkReport = loadReport(benchmarkPath);
    const benchmarkStats = benchmarkReport
      ? {
          available: true,
          generatedAt: benchmarkReport.generatedAt,
          summary: benchmarkReport.summary,
          file: path.basename(benchmarkPath),
        }
      : {
          available: false,
          message: "Run: npm run benchmark:queries",
        };

    const workerStats = {
      available: true,
      poolSize: 4,
      note: "Worker threads ready for CPU-bound tasks",
    };

    return NextResponse.json({
      success: true,
      queue: queueStats,
      indexes: indexStats,
      benchmarks: benchmarkStats,
      workers: workerStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

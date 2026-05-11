/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const mysql = require("mysql2/promise");

const DEFAULT_PORT = 3306;
const WARMUP_RUNS = 3;
const TEST_RUNS = 10;

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] ?? "";
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

function getEnv() {
  const env = { ...process.env };
  if (!env.DATABASE_URL && !env.DB_HOST) {
    const envLocal = parseEnvFile(path.join(process.cwd(), ".env.local"));
    const envBase = parseEnvFile(path.join(process.cwd(), ".env"));
    return { ...envBase, ...envLocal, ...env };
  }
  return env;
}

function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : DEFAULT_PORT,
    user: decodeURIComponent(url.username || ""),
    password: decodeURIComponent(url.password || ""),
    database: url.pathname ? url.pathname.replace(/^\//, "") : "",
  };
}

function resolveDbConfig() {
  const env = getEnv();

  if (env.DATABASE_URL) {
    return parseDatabaseUrl(env.DATABASE_URL);
  }

  if (!env.DB_HOST || !env.DB_USER || !env.DB_NAME) {
    throw new Error(
      "Missing DB configuration. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT."
    );
  }

  return {
    host: env.DB_HOST,
    port: env.DB_PORT ? Number(env.DB_PORT) : DEFAULT_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME,
  };
}

async function runBenchmark(connection, query, label) {
  const times = [];

  console.log(`\n⏱️  Benchmarking: ${label}`);
  console.log(`   Running ${WARMUP_RUNS} warmup runs...`);

  // Warmup runs (not counted)
  for (let i = 0; i < WARMUP_RUNS; i++) {
    try {
      await connection.query(query);
    } catch (err) {
      console.error(`   ✗ Warmup run ${i + 1} failed:`, err.message);
      return null;
    }
  }

  console.log(`   Running ${TEST_RUNS} test runs...`);

  // Actual test runs
  for (let i = 0; i < TEST_RUNS; i++) {
    const start = performance.now();
    try {
      await connection.query(query);
    } catch (err) {
      console.error(`   ✗ Test run ${i + 1} failed:`, err.message);
      return null;
    }
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.slice().sort((a, b) => a - b)[Math.floor(times.length / 2)];

  console.log(`   ✓ ${label}`);
  console.log(`     Min:    ${min.toFixed(2)}ms`);
  console.log(`     Max:    ${max.toFixed(2)}ms`);
  console.log(`     Avg:    ${avg.toFixed(2)}ms`);
  console.log(`     Median: ${median.toFixed(2)}ms`);

  return { label, min, max, avg, median, times };
}

async function main() {
  console.log("📊 Query Performance Benchmarking Tool");
  console.log("═══════════════════════════════════════════════════════════");

  const config = resolveDbConfig();
  const connection = await mysql.createConnection(config);

  const benchmarks = [];

  try {
    // Benchmark common queries
    const queries = [
      {
        label: "Get open tickets (index scan)",
        query: "SELECT id, userId, serviceId, status, createdAt FROM Ticket WHERE status = 'OPEN' LIMIT 100",
      },
      {
        label: "Get user tickets with sort",
        query:
          "SELECT id, serviceId, status, createdAt FROM Ticket WHERE userId = 1 ORDER BY createdAt DESC LIMIT 50",
      },
      {
        label: "Get high-priority tickets",
        query:
          "SELECT id, userId, agentId, finalPriority FROM Ticket WHERE finalPriority = 'HIGH' AND status IN ('OPEN', 'IN_PROGRESS') LIMIT 100",
      },
      {
        label: "Agent dashboard query",
        query:
          "SELECT id, userId, serviceId, status, finalPriority FROM Ticket WHERE agentId = 1 AND status IN ('OPEN', 'IN_PROGRESS') ORDER BY finalPriority DESC LIMIT 50",
      },
      {
        label: "Payment lookup by user",
        query: "SELECT id, amount, status, createdAt FROM Payment WHERE userId = 1 ORDER BY createdAt DESC LIMIT 50",
      },
      {
        label: "Delivery status check",
        query:
          "SELECT id, trackingNumber, status, lastUpdated FROM Delivery WHERE status = 'IN_TRANSIT' AND lastUpdated > DATE_SUB(NOW(), INTERVAL 7 DAY) LIMIT 100",
      },
      {
        label: "Full table scan (Ticket)",
        query: "SELECT COUNT(*) as count FROM Ticket",
      },
      {
        label: "Queue position query",
        query:
          "SELECT id, userId, queuePosition FROM Ticket WHERE queuePosition > 0 AND queuePosition <= 50 ORDER BY queuePosition",
      },
    ];

    for (const { label, query } of queries) {
      const result = await runBenchmark(connection, query, label);
      if (result) {
        benchmarks.push(result);
      }
    }

    // Print summary
    console.log("\n" + "═".repeat(60));
    console.log("📈 BENCHMARK SUMMARY");
    console.log("═".repeat(60));

    benchmarks.sort((a, b) => a.avg - b.avg);

    console.log("\n✅ FASTEST QUERIES:");
    benchmarks.slice(0, 3).forEach((b, i) => {
      console.log(`${i + 1}. ${b.label}`);
      console.log(`   Average: ${b.avg.toFixed(2)}ms`);
    });

    console.log("\n⚠️  SLOWEST QUERIES:");
    benchmarks.slice(-3).forEach((b, i) => {
      console.log(`${benchmarks.length - i}. ${b.label}`);
      console.log(`   Average: ${b.avg.toFixed(2)}ms`);
    });

    // Generate JSON report
    const report = {
      generatedAt: new Date().toISOString(),
      database: config.database,
      configuration: {
        warmupRuns: WARMUP_RUNS,
        testRuns: TEST_RUNS,
      },
      benchmarks,
      summary: {
        fastest: benchmarks[0],
        slowest: benchmarks[benchmarks.length - 1],
        averageAvg: (benchmarks.reduce((sum, b) => sum + b.avg, 0) / benchmarks.length).toFixed(2),
      },
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(process.cwd(), `query-benchmark-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`\n✅ JSON report saved: ${outputFile}`);

    console.log("\n💡 RECOMMENDATIONS:");
    console.log("   • Monitor queries with average > 50ms");
    console.log("   • Add indexes for frequently filtered columns");
    console.log("   • Use EXPLAIN to analyze slow queries");
    console.log("   • Run benchmarks weekly to track performance");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("❌ Query benchmarking failed:", error.message);
  process.exit(1);
});

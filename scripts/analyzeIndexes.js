/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const mysql = require("mysql2/promise");

const DEFAULT_PORT = 3306;
const LARGE_TABLE_ROWS = 10000;
const LARGE_TABLE_BYTES = 10 * 1024 * 1024;
const WIDE_INDEX_COLUMNS = 3;

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

function groupIndexes(rows) {
  const indexMap = new Map();
  for (const row of rows) {
    const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}.${row.INDEX_NAME}`;
    if (!indexMap.has(key)) {
      indexMap.set(key, {
        schema: row.TABLE_SCHEMA,
        table: row.TABLE_NAME,
        name: row.INDEX_NAME,
        isUnique: row.NON_UNIQUE === 0,
        type: row.INDEX_TYPE,
        columns: [],
      });
    }
    indexMap.get(key).columns.push(row.COLUMN_NAME);
  }
  return Array.from(indexMap.values());
}

function buildUsageMap(rows) {
  const usageMap = new Map();
  for (const row of rows) {
    const key = `${row.table_schema}.${row.table_name}.${row.index_name}`;
    usageMap.set(key, {
      reads: Number(row.reads || 0),
      writes: Number(row.writes || 0),
    });
  }
  return usageMap;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function loadIndexes(connection, database) {
  const [rows] = await connection.query(
    `
    SELECT
      TABLE_SCHEMA,
      TABLE_NAME,
      INDEX_NAME,
      COLUMN_NAME,
      SEQ_IN_INDEX,
      NON_UNIQUE,
      INDEX_TYPE
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = ?
    ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `,
    [database]
  );

  return rows;
}

async function loadTableStats(connection, database) {
  const [rows] = await connection.query(
    `
    SELECT
      TABLE_SCHEMA,
      TABLE_NAME,
      TABLE_ROWS,
      DATA_LENGTH,
      INDEX_LENGTH
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = ?
    `,
    [database]
  );
  return rows;
}

async function loadIndexUsage(connection, database) {
  try {
    const [rows] = await connection.query(
      `
      SELECT
        OBJECT_SCHEMA AS table_schema,
        OBJECT_NAME AS table_name,
        INDEX_NAME AS index_name,
        COUNT_READ AS reads,
        COUNT_WRITE AS writes
      FROM performance_schema.table_io_waits_summary_by_index_usage
      WHERE OBJECT_SCHEMA = ?
      `,
      [database]
    );
    return rows;
  } catch {
    console.warn("⚠️  performance_schema index usage stats unavailable. Skipping usage analysis.");
    return [];
  }
}

function analyzeIndexes({ indexes, tableStats, usageMap }) {
  const tables = new Map();
  const unusedIndexes = [];
  const wideIndexes = [];
  const missingIndexes = [];

  for (const stat of tableStats) {
    tables.set(`${stat.TABLE_SCHEMA}.${stat.TABLE_NAME}`, {
      schema: stat.TABLE_SCHEMA,
      table: stat.TABLE_NAME,
      rows: Number(stat.TABLE_ROWS || 0),
      dataLength: Number(stat.DATA_LENGTH || 0),
      indexLength: Number(stat.INDEX_LENGTH || 0),
      indexes: [],
    });
  }

  for (const index of indexes) {
    const tableKey = `${index.schema}.${index.table}`;
    const table = tables.get(tableKey) || {
      schema: index.schema,
      table: index.table,
      rows: 0,
      dataLength: 0,
      indexLength: 0,
      indexes: [],
    };

    const usageKey = `${index.schema}.${index.table}.${index.name}`;
    const usage = usageMap.get(usageKey);
    const reads = usage ? usage.reads : null;
    const writes = usage ? usage.writes : null;

    const indexInfo = {
      ...index,
      reads,
      writes,
    };

    table.indexes.push(indexInfo);
    tables.set(tableKey, table);

    if (index.columns.length > WIDE_INDEX_COLUMNS) {
      wideIndexes.push(indexInfo);
    }

    if (usage && reads === 0 && writes === 0 && index.name !== "PRIMARY") {
      unusedIndexes.push(indexInfo);
    }
  }

  for (const table of tables.values()) {
    const nonPrimaryIndexes = table.indexes.filter((idx) => idx.name !== "PRIMARY");
    const isLarge =
      table.rows >= LARGE_TABLE_ROWS || table.dataLength >= LARGE_TABLE_BYTES || table.indexLength >= LARGE_TABLE_BYTES;

    if (isLarge && nonPrimaryIndexes.length === 0) {
      missingIndexes.push({
        schema: table.schema,
        table: table.table,
        rows: table.rows,
        dataLength: table.dataLength,
        indexLength: table.indexLength,
        message: "Large table has no secondary indexes. Consider adding indexes for frequent filters/joins.",
      });
    }
  }

  return {
    tables: Array.from(tables.values()),
    unusedIndexes,
    wideIndexes,
    missingIndexes,
  };
}

function printSummary(analysis) {
  console.log("📊 Index Analysis Summary");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Tables analyzed: ${analysis.tables.length}`);
  console.log(`Unused indexes:  ${analysis.unusedIndexes.length}`);
  console.log(`Wide indexes:    ${analysis.wideIndexes.length}`);
  console.log(`Missing indexes: ${analysis.missingIndexes.length}`);
  console.log("");

  if (analysis.unusedIndexes.length > 0) {
    console.log("⚠️  Unused indexes (0 reads/writes):");
    analysis.unusedIndexes.forEach((idx) => {
      console.log(`  - ${idx.schema}.${idx.table}.${idx.name} (${idx.columns.join(", ")})`);
    });
    console.log("");
  }

  if (analysis.wideIndexes.length > 0) {
    console.log(`⚠️  Wide indexes (> ${WIDE_INDEX_COLUMNS} columns):`);
    analysis.wideIndexes.forEach((idx) => {
      console.log(`  - ${idx.schema}.${idx.table}.${idx.name} (${idx.columns.join(", ")})`);
    });
    console.log("");
  }

  if (analysis.missingIndexes.length > 0) {
    console.log("⚠️  Large tables without secondary indexes:");
    analysis.missingIndexes.forEach((table) => {
      console.log(
        `  - ${table.schema}.${table.table} (rows: ${table.rows}, data: ${formatBytes(table.dataLength)})`
      );
    });
    console.log("");
  }
}

async function main() {
  console.log("🔍 Starting database index analysis...");
  const config = resolveDbConfig();
  const connection = await mysql.createConnection(config);

  try {
    const [indexesRaw, tableStats, usageRows] = await Promise.all([
      loadIndexes(connection, config.database),
      loadTableStats(connection, config.database),
      loadIndexUsage(connection, config.database),
    ]);

    const indexes = groupIndexes(indexesRaw);
    const usageMap = buildUsageMap(usageRows);

    const analysis = analyzeIndexes({ indexes, tableStats, usageMap });
    const report = {
      generatedAt: new Date().toISOString(),
      database: config.database,
      totals: {
        tables: analysis.tables.length,
        indexes: indexes.length,
        unusedIndexes: analysis.unusedIndexes.length,
        wideIndexes: analysis.wideIndexes.length,
        missingIndexes: analysis.missingIndexes.length,
      },
      tables: analysis.tables,
      unusedIndexes: analysis.unusedIndexes,
      wideIndexes: analysis.wideIndexes,
      missingIndexes: analysis.missingIndexes,
    };

    printSummary(analysis);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(process.cwd(), `index-analysis-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`✅ JSON report saved: ${outputFile}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("❌ Index analysis failed:", error.message);
  process.exit(1);
});

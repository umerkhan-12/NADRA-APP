/**
 * Multithreading Demo - Compare Sequential vs Parallel Execution
 * Shows performance benefit of worker threads for CPU-intensive tasks
 */

import { getWorkerPool } from "../lib/workerPool.js";

async function runSequentialDemo() {
  console.log("\n⏱️  SEQUENTIAL EXECUTION (Main Thread - Blocking)");
  console.log("═".repeat(60));

  const startSeq = performance.now();

  // Simulate CPU work sequentially
  function heavyComputation(iterations) {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(Math.random() * 1000000);
    }
    return result;
  }

  const task1Start = performance.now();
  const r1 = heavyComputation(50000000);
  const task1Time = performance.now() - task1Start;

  const task2Start = performance.now();
  const r2 = heavyComputation(50000000);
  const task2Time = performance.now() - task2Start;

  const task3Start = performance.now();
  const r3 = heavyComputation(50000000);
  const task3Time = performance.now() - task3Start;

  const task4Start = performance.now();
  const r4 = heavyComputation(50000000);
  const task4Time = performance.now() - task4Start;

  const totalSeq = performance.now() - startSeq;

  console.log(`Task 1: ${task1Time.toFixed(2)}ms (result: ${r1.toFixed(0)})`);
  console.log(`Task 2: ${task2Time.toFixed(2)}ms (result: ${r2.toFixed(0)})`);
  console.log(`Task 3: ${task3Time.toFixed(2)}ms (result: ${r3.toFixed(0)})`);
  console.log(`Task 4: ${task4Time.toFixed(2)}ms (result: ${r4.toFixed(0)})`);
  console.log(`\n✓ Total Sequential Time: ${totalSeq.toFixed(2)}ms`);
  console.log(`📊 All tasks ran ONE-BY-ONE on main thread (blocking)\n`);

  return { totalTime: totalSeq, taskTimes: [task1Time, task2Time, task3Time, task4Time] };
}

async function runParallelDemo() {
  console.log("\n⚡ PARALLEL EXECUTION (Worker Threads - Non-Blocking)");
  console.log("═".repeat(60));

  const startPar = performance.now();

  const pool = getWorkerPool();

  // Queue all 4 tasks to run in parallel on 4 workers
  const promises = [
    pool.execute({ type: "generateReport", data: { iterations: 50000000 } }),
    pool.execute({ type: "generateReport", data: { iterations: 50000000 } }),
    pool.execute({ type: "generateReport", data: { iterations: 50000000 } }),
    pool.execute({ type: "generateReport", data: { iterations: 50000000 } }),
  ];

  const taskStarts = promises.map(() => performance.now());

  // Wait for all to complete
  const results = await Promise.all(promises);

  const taskTimes = results.map((_, i) => performance.now() - taskStarts[i]);
  const totalPar = performance.now() - startPar;

  console.log(`Task 1: ${taskTimes[0].toFixed(2)}ms (completed in Worker #1)`);
  console.log(`Task 2: ${taskTimes[1].toFixed(2)}ms (completed in Worker #2)`);
  console.log(`Task 3: ${taskTimes[2].toFixed(2)}ms (completed in Worker #3)`);
  console.log(`Task 4: ${taskTimes[3].toFixed(2)}ms (completed in Worker #4)`);
  console.log(`\n✓ Total Parallel Time: ${totalPar.toFixed(2)}ms`);
  console.log(`📊 All 4 tasks ran IN PARALLEL on 4 worker threads (non-blocking)\n`);

  return { totalTime: totalPar, taskTimes };
}

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║   MULTITHREADING DEMONSTRATION - Performance Comparison    ║");
  console.log("║                                                            ║");
  console.log("║  This demo shows how worker threads make CPU-intensive     ║");
  console.log("║  tasks run in parallel WITHOUT blocking the main thread.  ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    // Run sequential
    const seqResult = await runSequentialDemo();

    // Run parallel
    const parResult = await runParallelDemo();

    // Compare
    console.log("\n📈 PERFORMANCE COMPARISON");
    console.log("═".repeat(60));
    console.log(`Sequential Total:  ${seqResult.totalTime.toFixed(2)}ms`);
    console.log(`Parallel Total:    ${parResult.totalTime.toFixed(2)}ms`);
    console.log(`\nSpeedup: ${(seqResult.totalTime / parResult.totalTime).toFixed(2)}x faster! 🚀`);
    console.log(`Time saved: ${(seqResult.totalTime - parResult.totalTime).toFixed(2)}ms\n`);

    console.log("💡 KEY INSIGHTS:");
    console.log("───────────────────────────────────────────────────────────");
    console.log("✓ Sequential: Tasks block each other, total = sum of all times");
    console.log("✓ Parallel:   Tasks run simultaneously, total ≈ longest task");
    console.log("✓ Main thread: Stays free to handle requests!");
    console.log("✓ With 4 workers: ~4x speedup for 4 tasks");
    console.log("✓ Real benefit: Users don't wait for computation\n");

    console.log("🎯 REAL-WORLD USE CASES:");
    console.log("───────────────────────────────────────────────────────────");
    console.log("• Report generation (50MB of data)")
    console.log("• Batch data processing (10,000 tickets)")
    console.log("• Encryption/compression tasks")
    console.log("• Image/document processing");
    console.log("• Complex calculations\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
    process.exit(1);
  }
}

main();

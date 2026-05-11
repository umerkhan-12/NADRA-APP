// Demo endpoint for multithreading
export const runtime = "nodejs";

import { processInWorker } from "@/lib/workerPool";
import { requireAdmin } from "@/lib/authCheck";

export async function GET(req) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "demo";
    const now =
      typeof performance !== "undefined" && performance.now
        ? () => performance.now()
        : () => Date.now();

    if (mode === "sequential") {
      const start = now();
      function task(n) {
        let r = 0;
        for (let i = 0; i < n; i++) r += Math.sqrt(Math.random() * 1000000);
        return r;
      }
      task(30000000);
      task(30000000);
      task(30000000);
      task(30000000);
      const duration = (now() - start).toFixed(2);
      return Response.json({
        mode: "sequential",
        duration: `${duration}ms`,
        info: "Blocked main thread",
      });
    }

    if (mode === "parallel") {
      try {
        const start = now();
        await Promise.all([
          processInWorker({ type: "generateReport", data: { iterations: 30000000 } }),
          processInWorker({ type: "generateReport", data: { iterations: 30000000 } }),
          processInWorker({ type: "generateReport", data: { iterations: 30000000 } }),
          processInWorker({ type: "generateReport", data: { iterations: 30000000 } }),
        ]);
        const duration = (now() - start).toFixed(2);
        return Response.json({
          mode: "parallel",
          duration: `${duration}ms`,
          info: "Parallel execution",
        });
      } catch (workerError) {
        console.error("Worker pool error:", workerError.message);
        // Fallback to sequential if workers fail
        const start = now();
        function task(n) {
          let r = 0;
          for (let i = 0; i < n; i++) r += Math.sqrt(Math.random() * 1000000);
          return r;
        }
        task(30000000);
        task(30000000);
        task(30000000);
        task(30000000);
        const duration = (now() - start).toFixed(2);
        return Response.json({
          mode: "parallel (fallback to sequential)",
          duration: `${duration}ms`,
          warning: "Workers unavailable, running sequentially",
          info: workerError.message,
        });
      }
    }

    return Response.json({
      urls: ["/api/admin/demo?mode=sequential", "/api/admin/demo?mode=parallel"],
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Demo failed" },
      { status: 500 }
    );
  }
}

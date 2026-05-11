/**
 * Worker Thread Pool for CPU-intensive tasks
 * Handles parallel processing without blocking event loop
 */

import { Worker } from "worker_threads";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveWorkerPath() {
  const candidates = [
    path.resolve(process.cwd(), "lib", "worker.js"),
    path.resolve(__dirname, "worker.js"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

class WorkerPool {
  constructor(maxWorkers = 4) {
    this.maxWorkers = maxWorkers;
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = new Set();
    this.init();
  }

  init() {
    const resolvedWorkerPath = resolveWorkerPath();
    if (!resolvedWorkerPath) {
      console.error("Worker script not found. Checked:");
      console.error(path.resolve(process.cwd(), "lib", "worker.js"));
      console.error(path.resolve(__dirname, "worker.js"));
      return;
    }

    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(resolvedWorkerPath, { type: "module" });
        worker.on("error", (err) => console.error("Worker error:", err));
        worker.on("exit", (code) => {
          if (code !== 0) {
            console.error(`Worker exited with code ${code}`);
          }
        });
        this.workers.push(worker);
      } catch (err) {
        console.error(`Failed to create worker: ${err.message}`);
        console.error(`Worker path: ${resolvedWorkerPath}`);
      }
    }
    console.log(`✓ Worker pool initialized (${this.workers.length}/${this.maxWorkers} workers)`);
  }

  execute(task) {
    return new Promise((resolve, reject) => {
      const executeTask = () => {
        if (this.activeWorkers.size >= this.maxWorkers) {
          this.taskQueue.push({ task, resolve, reject });
          return;
        }

        const worker = this.workers[this.activeWorkers.size % this.maxWorkers];
        this.activeWorkers.add(worker);

        const timeout = setTimeout(() => {
          reject(new Error("Worker task timeout"));
          this.activeWorkers.delete(worker);
          this.processQueue();
        }, 30000);

        worker.once("message", (result) => {
          clearTimeout(timeout);
          this.activeWorkers.delete(worker);
          resolve(result);
          this.processQueue();
        });

        worker.once("error", (error) => {
          clearTimeout(timeout);
          this.activeWorkers.delete(worker);
          reject(error);
          this.processQueue();
        });

        worker.postMessage(task);
      };

      executeTask();
    });
  }

  processQueue() {
    if (this.taskQueue.length > 0) {
      const { task, resolve, reject } = this.taskQueue.shift();
      this.execute(task).then(resolve).catch(reject);
    }
  }

  terminate() {
    return Promise.all(this.workers.map((w) => w.terminate()));
  }
}

// Global pool instance
let globalPool;

export function getWorkerPool() {
  if (!globalPool && typeof window === "undefined") {
    globalPool = new WorkerPool(4);
  }
  return globalPool;
}

export async function processInWorker(data) {
  const pool = getWorkerPool();
  if (!pool) throw new Error("Worker pool not available");
  return pool.execute(data);
}

export async function terminateWorkerPool() {
  if (globalPool) {
    await globalPool.terminate();
    globalPool = null;
  }
}

const workerPoolApi = {
  getWorkerPool,
  processInWorker,
  terminateWorkerPool,
};

export default workerPoolApi;

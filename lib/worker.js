/**
 * Worker Thread for CPU-intensive tasks
 * Processes messages from main thread
 */

import { parentPort } from "worker_threads";

// Example CPU-intensive tasks

function generateReport(data) {
  // Simulate heavy computation: matrix multiplication, data aggregation
  const result = {
    input: data,
    timestamp: new Date().toISOString(),
    computed: [],
  };

  // Simulate CPU work
  for (let i = 0; i < 1000000; i++) {
    result.computed.push(Math.sqrt(Math.random()));
  }

  return result;
}

function processLargeDataset(data) {
  // Simulate processing large dataset
  const processed = {
    originalSize: data.length,
    processedAt: new Date().toISOString(),
    results: [],
  };

  for (const item of data) {
    processed.results.push({
      ...item,
      hash: hashData(item),
      processed: true,
    });
  }

  return processed;
}

function hashData(obj) {
  let hash = 0;
  const str = JSON.stringify(obj);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

function encryptData(text) {
  // Simulate encryption: multiple passes of transformation
  let result = text;
  for (let i = 0; i < 10000; i++) {
    result = Buffer.from(result)
      .toString("base64")
      .split("")
      .reverse()
      .join("");
  }
  return result;
}

// Listen for messages from main thread
parentPort.on("message", async (task) => {
  try {
    let result;

    switch (task.type) {
      case "generateReport":
        result = generateReport(task.data);
        break;

      case "processDataset":
        result = processLargeDataset(task.data);
        break;

      case "encrypt":
        result = encryptData(task.data);
        break;

      case "customTask":
        // Execute custom function if provided
        if (task.fn) {
          result = new Function("data", task.fn)(task.data);
        }
        break;

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});

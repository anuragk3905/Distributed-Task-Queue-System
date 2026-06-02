import { Queue } from "bullmq";
import { connection } from "./src/config/redis.js";
const reportQueue = new Queue("report-tasks", { connection });

async function run() {
  const waiting = await reportQueue.getWaiting(0, 1);
  if (waiting.length > 0) {
    const job = waiting[0];
    console.log("Job ID:", job.id);
    console.log("Job timestamp:", job.timestamp);
    console.log("Job type of timestamp:", typeof job.timestamp);
    console.log("isCompleted method exists:", typeof job.isCompleted);
  } else {
    console.log("No jobs waiting");
  }
  process.exit(0);
}

run();

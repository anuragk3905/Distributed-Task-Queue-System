import { Queue } from "bullmq";
import { connection } from "./src/config/redis.js";
const reportQueue = new Queue("report-tasks", { connection });

async function run() {
  const job = await reportQueue.add("test-job", { test: true });
  console.log("Added job:", job.id);
  
  const waitingCount = await reportQueue.getWaitingCount();
  console.log("Waiting count:", waitingCount);
  const jobs = await reportQueue.getJobs(["waiting", "active", "completed", "failed", "delayed"]);
  console.log("Jobs length:", jobs.length);
  if (jobs.length > 0) {
    console.log("Job 0 ID:", jobs[0].id);
  }
  process.exit(0);
}

run();

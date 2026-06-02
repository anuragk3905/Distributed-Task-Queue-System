import { Worker } from "bullmq";
import { connection } from "./config/redis.js";
import { dlqQueue } from "./queues/dlqQueue.js";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io(process.env.SOCKET_URL!);

socket.on("connect", () => {
console.log(
"Worker connected to socket server"
);
});

socket.on("connect_error", (err) => {
console.log(
"Socket Error:",
err.message
);
});

const workerId=
`worker-${Math.random()
.toString(36)
.slice(2,8)}`;

const sendHeartbeat=async()=> {
try {
await axios.post(
`${process.env.API_URL}/api/workers/heartbeat`,
{
workerId,
status:"active",
},
);
} catch(error){
console.log(
"Heartbeat Error:",
error
);
}
};

setInterval(()=>{
sendHeartbeat();
},5000);

sendHeartbeat();

const handleJobFailure = async (job: any, err: any, logPrefix: string) => {
  console.log(`${logPrefix}: ${job?.id}`);
  console.log("Error:", err?.message);

  const isDead = job && job.attemptsMade >= (job.opts?.attempts || 0);

  socket.emit("job-progress", {
    jobId: job?.id,
    status: isDead ? "dead" : "failed",
    progress: 0,
    error: err?.message,
    attemptsMade: job?.attemptsMade,
  });

  if (isDead) {
    console.log("Moving job to Dead Letter Queue");
    await dlqQueue.add("dead-job", {
      originalQueue: job.queueName,
      originalJobId: job.id,
      originalJob: job.data,
      failedReason: err?.message,
      attemptsMade: job.attemptsMade,
      failedAt: new Date().toISOString(),
    });
  }
};

const worker = new Worker(
  "email-tasks",
  async (job) => {
  console.log("Processing Job:", job.id);
  console.log("Attempt:", job.attemptsMade + 1);
  console.log("Job Data:", job.data);

  await job.updateProgress(10);

  socket.emit("job-progress", {
jobId: job.id,
status: "active",
progress: 10,
message: "Starting job",
});

  console.log("10%");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await job.updateProgress(50);

  socket.emit("job-progress", {
jobId: job.id,
status: "active",
progress: 50,
message: "Processing task",
});

  console.log("50%");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (job.attemptsMade < 4) {
    throw new Error("Simulated Failure");
  }

  await job.updateProgress(100);

  socket.emit("job-progress", {
jobId: job.id,
status: "completed",
progress: 100,
message: "Task completed",
});

  console.log("100%");
  console.log("Task Completed");

  return {
    success: true,
  };
},
  {
connection,

limiter:{
max:10,
duration:1000,
},
}
);

worker.on("completed", (job) => {
console.log(`Completed Job: ${job.id}`);

socket.emit("job-progress", {
jobId: job.id,
status: "completed",
progress: 100,
});
});

worker.on("failed", async (job, err) => {
  await handleJobFailure(job, err, "Failed Job");
});


const reportWorker = new Worker(
  "report-tasks",
  async (job) => {
    console.log("Processing Report Workflow Job:", job.id);
    
    socket.emit("job-progress", {
      jobId: job.id,
      status: "active",
      progress: 33,
      message: "Generating data..."
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await job.updateProgress(33);

    socket.emit("job-progress", {
      jobId: job.id,
      status: "active",
      progress: 66,
      message: "Generating PDF..."
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await job.updateProgress(66);

    socket.emit("job-progress", {
      jobId: job.id,
      status: "active",
      progress: 100,
      message: "Sending email..."
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(100);

    return { success: true, reportUrl: "https://example.com/report.pdf" };
  },
  { connection }
);

reportWorker.on("completed", (job) => {
  console.log(`Completed Report Workflow: ${job.id}`);
  socket.emit("job-progress", {
    jobId: job.id,
    status: "completed",
    progress: 100,
  });
});

reportWorker.on("failed", async (job, err) => {
  await handleJobFailure(job, err, "Failed Report Workflow");
});

const imageWorker = new Worker(
  "image-tasks",
  async (job) => {
    console.log("Processing Image Job:", job.id);
    
    socket.emit("job-progress", { jobId: job.id, status: "active", progress: 25, message: "Downloading image..." });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await job.updateProgress(25);

    socket.emit("job-progress", { jobId: job.id, status: "active", progress: 50, message: "Applying filters..." });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await job.updateProgress(50);

    socket.emit("job-progress", { jobId: job.id, status: "active", progress: 80, message: "Saving to storage..." });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await job.updateProgress(80);

    return { success: true, url: "https://example.com/processed-image.jpg" };
  },
  { connection }
);

imageWorker.on("completed", (job) => {
  console.log(`Completed Image Job: ${job.id}`);
  socket.emit("job-progress", { jobId: job.id, status: "completed", progress: 100 });
});

imageWorker.on("failed", async (job, err) => {
  await handleJobFailure(job, err, "Failed Image Job");
});

const notificationWorker = new Worker(
  "notification-tasks",
  async (job) => {
    console.log("Processing Notification Job:", job.id);
    
    socket.emit("job-progress", { jobId: job.id, status: "active", progress: 50, message: "Formatting payload..." });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(50);

    socket.emit("job-progress", { jobId: job.id, status: "active", progress: 90, message: "Dispatching to APNS/FCM..." });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await job.updateProgress(90);

    return { success: true, delivered: true };
  },
  { connection }
);

notificationWorker.on("completed", (job) => {
  console.log(`Completed Notification Job: ${job.id}`);
  socket.emit("job-progress", { jobId: job.id, status: "completed", progress: 100 });
});

notificationWorker.on("failed", async (job, err) => {
  await handleJobFailure(job, err, "Failed Notification Job");
});

console.log("Worker Service Running");
import { QueueEvents, Queue } from "bullmq";
import { Redis } from "ioredis";
import { AuditLog } from "../models/AuditLog.js";
import { Task } from "../models/Task.js";
import { jobsProcessed,jobDuration } from "../config/metrics.js";

const queueEventsConnection=new Redis(
process.env.UPSTASH_REDIS_URL!,
{
maxRetriesPerRequest:null,
}
);

const queueNames = ["email-tasks", "image-tasks", "report-tasks", "notification-tasks"];

const queues: Record<string, Queue> = {};

queueNames.forEach((queueName) => {
  queues[queueName] = new Queue(queueName, { connection: queueEventsConnection });
  const queueEvents = new QueueEvents(
    queueName,
    {
      connection:queueEventsConnection,
    }
  );

  queueEvents.on("active",async({ jobId })=>{
  console.log(`Job Active [${queueName}]:`,jobId);

  await Task.findOneAndUpdate(
  { jobId },
  {
  status:"active",
  error:null,
  progress:0,
  }
  );

  const task=await Task.findOne({ jobId });

  if(task){
  await AuditLog.create({
  taskId:String(task._id),
  jobId,
  event:"active",
  message:`Job started processing in ${queueName}`,
  });
  }
  });

  queueEvents.on("progress",async({ jobId,data })=>{
  console.log(`Job Progress [${queueName}]:`,jobId,data);

  await Task.findOneAndUpdate(
  { jobId },
  {
  progress:Number(data),
  }
  );

  const task=await Task.findOne({ jobId });

  if(task){
  await AuditLog.create({
  taskId:String(task._id),
  jobId,
  event:"progress",
  progress:Number(data),
  message:`Progress updated to ${data}%`,
  });
  }
  });

  queueEvents.on("completed",async({ jobId,returnvalue })=>{
  console.log(`Job Completed [${queueName}]:`,jobId);

  await Task.findOneAndUpdate(
  { jobId },
  {
  status:"completed",
  progress:100,
  result:returnvalue,
  completedAt:new Date(),
  }
  );

  jobsProcessed.inc({
  status:"completed",
  });

  if(
  returnvalue &&
  typeof returnvalue === "object" &&
  "duration" in returnvalue
  ){
  jobDuration.observe(
  (returnvalue as Record<string, number>).duration/1000
  );
  }

  const task=await Task.findOne({ jobId });

  if(task){
  await AuditLog.create({
  taskId:String(task._id),
  jobId,
  event:"completed",
  progress:100,
  message:"Job completed successfully",
  metadata:returnvalue,
  });
  }
  });

  queueEvents.on(
  "failed",
  async({ jobId,failedReason })=>{

  console.log(`Job Failed [${queueName}]:`,jobId);

  const task=await Task.findOne({
  jobId,
  });

  if(!task) return;

  const targetQueue = queues[queueName];
  const job = await targetQueue.getJob(jobId);

  const attemptsMade = job ? job.attemptsMade : task.attempts + 1;
  const maxAttempts = job && job.opts ? (job.opts.attempts || task.maxAttempts) : task.maxAttempts;

  const isDead = attemptsMade >= maxAttempts;

  await Task.findOneAndUpdate(
  { jobId },
  {
  status:isDead
  ? "dead"
  : "failed",
  error:failedReason,
  attempts:attemptsMade,
  }
  );

  jobsProcessed.inc({
  status:isDead
  ? "dead"
  : "failed",
  });

  await AuditLog.create({
  taskId:String(task._id),
  jobId,
  event:isDead
  ? "dead"
  : "failed",
  message:failedReason,
  metadata:{
  attempts:attemptsMade,
  },
  });
  }
  );
});
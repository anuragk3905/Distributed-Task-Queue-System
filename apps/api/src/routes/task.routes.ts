import express from "express";
import { emailQueue } from "../queues/emailQueue.js";
import { Task } from "../models/Task.js";
import { AuditLog } from "../models/AuditLog.js";
import { flowProducer } from "../config/flowProducer.js";
import { Queue } from "bullmq";
import { connection } from "../config/redis.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole(["Admin", "Operator"]), async (req, res) => {
try {

const priorityMap = {
high: 1,
normal: 5,
low: 10,
};

const priority =
priorityMap[
req.body.priority as keyof typeof priorityMap
] || 5;

const delay =
Number(req.body.delay) || 0;

const repeatPattern =
req.body.repeatPattern;

const queueName = req.body.queue || "email-tasks";
const type = req.body.type || "send-email";

const task = await Task.create({
type,
queue: queueName,
status: "queued",
payload: req.body.data || req.body,
progress: 0,
priority,
isRecurring: !!repeatPattern,
cronPattern: repeatPattern || undefined,
scheduledAt:
delay > 0
? new Date(Date.now() + delay)
: undefined,
});

const targetQueue = new Queue(queueName, { connection });
const job = await targetQueue.add(
type,
{
...(req.body.data || req.body),
taskId: task._id,
},
{
priority,
delay,
attempts: 5,

repeat: repeatPattern
? {
pattern: repeatPattern,
}
: undefined,

backoff: {
type: "exponential",
delay: 1000,
},

removeOnComplete: {
count: 100,
},

removeOnFail: {
count: 500,
},
}
);

task.jobId = String(job.id);

if (repeatPattern) {
task.repeatJobKey = job.repeatJobKey;
}

await task.save();

await AuditLog.create({
taskId: String(task._id),
jobId: String(job.id),
event: "queued",
message: "Job added to queue",
});

res.json({
success: true,
taskId: task._id,
jobId: job.id,
});

} catch (error) {

console.log(error);

res.status(500).json({
success: false,
message: "Failed to create task",
});

}
});

router.get("/", async (req, res) => {
try {
const page =
Number(req.query.page) || 1;

const limit =
Number(req.query.limit) || 20;

const status = req.query.status;
const search=req.query.search;

const skip = (page - 1) * limit;

const query: any = {};

if(status){
query.status=status;
}

if(search){
query.$or=[
{
jobId:{
$regex:search,
$options:"i",
},
},
{
queue:{
$regex:search,
$options:"i",
},
},
{
type:{
$regex:search,
$options:"i",
},
},
];
}

const tasks = await Task.find(query)
.sort({
createdAt: -1,
})
.skip(skip)
.limit(limit);

const total = await Task.countDocuments(
query
);

res.json({
tasks,
total,
page,
limit,
});
} catch (error) {
console.log(error);

res.status(500).json({
success: false,
message: "Failed to fetch tasks",
});
}
});

router.get("/recurring/list",async(req,res)=>{
try{

const jobs=
await emailQueue.getRepeatableJobs();

res.json({
success:true,
jobs,
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Failed to fetch recurring jobs",
});
}
});

router.delete("/recurring/:key", requireRole(["Admin", "Operator"]), async(req,res)=>{
try{

await emailQueue.removeRepeatableByKey(
req.params.key as string
);

await Task.updateMany(
{
repeatJobKey:req.params.key,
},
{
status:"cancelled",
}
);

res.json({
success:true,
message:"Recurring job removed",
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Failed to remove recurring job",
});
}
}
);

router.get("/:taskId", async (req, res) => {
try {
const task = await Task.findById(
req.params.taskId
);

if (!task) {
return res.status(404).json({
success: false,
message: "Task not found",
});
}

res.json(task);
} catch (error) {
console.log(error);

res.status(500).json({
success: false,
message: "Failed to fetch task",
});
}
});

router.post("/:taskId/retry", requireRole(["Admin", "Operator"]), async (req, res) => {
try {
const task = await Task.findById(
req.params.taskId
);

if (!task) {
return res.status(404).json({
success: false,
message: "Task not found",
});
}

const retryQueue = new Queue(task.queue, { connection });
const job = await retryQueue.add(
task.type,
{
...task.payload,
taskId: task._id,
},
{
priority:task.priority,
attempts: task.maxAttempts,
backoff: {
type: "exponential",
delay: 1000,
},
removeOnComplete: {
count: 100,
},
removeOnFail: {
count: 500,
},
}
);
task.jobId = String(job.id);
task.status = "queued";
task.progress = 0;
task.error = "";
task.attempts = 0;
task.completedAt = undefined;
await task.save();
await AuditLog.create({
taskId:String(task._id),
jobId:String(job.id),
event:"retried",
message:"Task manually retried",
});

res.json({
success: true,
message: "Task retried",
jobId: job.id,
});
} catch (error) {
console.log(error);

res.status(500).json({
success: false,
message: "Failed to retry task",
});
}
}
);

router.delete("/:taskId", requireRole(["Admin"]), async (req, res) => {
try {
const task = await Task.findByIdAndDelete(
req.params.taskId
);

if (!task) {
return res.status(404).json({
success: false,
message: "Task not found",
});
}

res.json({
success: true,
message: "Task deleted",
});
} catch (error) {
console.log(error);

res.status(500).json({
success: false,
message: "Failed to delete task",
});
}
}
);

router.get("/:taskId/logs",async(req,res)=>{
try{

const logs=
await AuditLog.find({
taskId:req.params.taskId,
})
.sort({
createdAt:1,
});

res.json({
success:true,
logs,
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Failed to fetch logs",
});
}
}
);

router.post("/workflow/report-email", requireRole(["Admin", "Operator"]), async(req,res)=>{
try{

const flow=
await flowProducer.add({

name:"generate-report",

queueName:"email-tasks",

data:{
step:"report",
},

children:[
{
name:"generate-pdf",
queueName:"email-tasks",
data:{
step:"pdf",
},
children:[
{
name:"send-email",
queueName:"email-tasks",
data:{
step:"email",
to:req.body.to,
},
},
],
},
],
});

await Task.create({
jobId:String(flow.job.id),
type:"workflow",
queue:"email-tasks",
status:"queued",
workflowName:"report-email",
flowId:String(flow.job.id),
isFlowJob:true,
payload:req.body,
});

res.json({
success:true,
flowId:flow.job.id,
message:"Workflow created",
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Workflow creation failed",
});
}
}
);

router.post("/:taskId/cancel", requireRole(["Admin", "Operator"]), async(req,res)=>{
try{

const task=await Task.findById(
req.params.taskId
);

if(!task){
return res.status(404).json({
success:false,
message:"Task not found",
});
}

if(
task.status==="completed" ||
task.status==="cancelled"
){
return res.status(400).json({
success:false,
message:`Cannot cancel ${task.status} task`,
});
}

if(task.jobId){

const cancelQueue = new Queue(task.queue, { connection });
const job=
await cancelQueue.getJob(
task.jobId
);

if(job){

const state=
await job.getState();

if(
state==="waiting" ||
state==="delayed"
){
await job.remove();
}
}
}

task.status="cancelled";
await task.save();

await AuditLog.create({
taskId:String(task._id),
jobId:task.jobId || "",
event:"cancelled",
message:"Task cancelled manually",
});

res.json({
success:true,
message:"Task cancelled",
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Failed to cancel task",
});
}
});

export default router;
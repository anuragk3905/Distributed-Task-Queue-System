import express from "express";
import { emailQueue } from "../queues/emailQueue.js";
import { dlqQueue } from "../queues/dlqQueue.js";
import { Queue } from "bullmq";
import { connection } from "../config/redis.js";
import { register,queueDepth } from "../config/metrics.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router=express.Router();

router.use(requireAuth);

const imageQueue=new Queue(
"image-tasks",
{connection}
);

const reportQueue=new Queue(
"report-tasks",
{connection}
);

const notificationQueue=new Queue(
"notification-tasks",
{connection}
);

const queues=[
emailQueue,
imageQueue,
reportQueue,
notificationQueue,
];

router.get("/metrics",async(_,res)=>{
try{

const metrics=await Promise.all(
queues.map(async(queue)=>{

const waiting=
await queue.getWaitingCount();

const active=
await queue.getActiveCount();

const completed=
await queue.getCompletedCount();

const failed=
await queue.getFailedCount();

queueDepth.set(
{queue:queue.name},
waiting
);

return{
name:queue.name,
waiting,
active,
completed,
failed,
dlq:
await dlqQueue.getWaitingCount(),
};
})
);

res.json({
queues:metrics,
});

}catch(error){
res.status(500).json({
success:false,
});
}
});

router.get("/status",async(_,res)=>{
try{

const statuses=
await Promise.all(
queues.map(async(queue)=>({
name:queue.name,
paused:await queue.isPaused(),
}))
);

res.json({
success:true,
queues:statuses,
isPaused: statuses.length > 0 && statuses.every(s => s.paused)
});

}catch(error){
res.status(500).json({
success:false,
message:"Failed to fetch status",
});
}
});

router.post("/pause", requireRole(["Admin"]), async(_,res)=>{
try{

await Promise.all(
queues.map(queue=>
queue.pause()
)
);

res.json({
success:true,
message:"All queues paused",
});

}catch(error){
res.status(500).json({
success:false,
message:"Failed to pause queues",
});
}
});

router.post("/resume", requireRole(["Admin"]), async(_,res)=>{
try{

await Promise.all(
queues.map(queue=>
queue.resume()
)
);

res.json({
success:true,
message:"All queues resumed",
});

}catch(error){
res.status(500).json({
success:false,
message:"Failed to resume queues",
});
}
});

router.get("/prometheus",async(_,res)=>{
res.set(
"Content-Type",
register.contentType
);

res.end(
await register.metrics()
);
});

export default router;
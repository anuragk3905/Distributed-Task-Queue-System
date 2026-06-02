import express from "express";
import { WorkerHealth } from "../models/WorkerHealth.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router=express.Router();

router.get("/", requireAuth, async(_,res)=>{
try{

const workers=
await WorkerHealth.find()
.sort({
lastHeartbeat:-1,
});

const activeWorkers=
workers.filter(
w=>w.status==="active"
).length;

const inactiveWorkers=
workers.filter(
w=>w.status==="inactive"
).length;

res.json({
workers,
summary:{
total:workers.length,
active:activeWorkers,
inactive:inactiveWorkers,
},
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Failed to fetch workers",
});
}
});

router.post("/heartbeat",async(req,res)=>{
try{

const { workerId,status }=
req.body;

await WorkerHealth.findOneAndUpdate(
{ workerId },
{
workerId,
status,
lastHeartbeat:new Date(),
},
{
upsert:true,
new:true,
}
);

res.json({
success:true,
});

}catch(error){
console.log(error);

res.status(500).json({
success:false,
message:"Heartbeat failed",
});
}
});

export default router;
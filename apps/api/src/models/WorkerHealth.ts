import mongoose from "mongoose";

const workerHealthSchema=new mongoose.Schema({
workerId:{
type:String,
required:true,
unique:true,
},
status:{
type:String,
enum:["active","inactive"],
default:"active",
},
processedCount:{
type:Number,
default:0,
},
lastHeartbeat:{
type:Date,
default:Date.now,
},
startedAt:{
type:Date,
default:Date.now,
},
},{
timestamps:true,
});

export const WorkerHealth=mongoose.model(
"WorkerHealth",
workerHealthSchema
);

setInterval(async()=>{
const timeout=new Date(
Date.now()-15000
);

await WorkerHealth.updateMany(
{
lastHeartbeat:{
$lt:timeout,
},
},
{
status:"inactive",
}
);
},10000);
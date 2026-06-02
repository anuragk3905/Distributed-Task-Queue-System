import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
{
taskId:{
type:String,
required:true,
index:true,
},

jobId:{
type:String,
required:true,
index:true,
},

event:{
type:String,
required:true,
enum:[
"queued",
"active",
"progress",
"completed",
"failed",
"retried",
"dead",
"cancelled",
],
},

message:{
type:String,
},

progress:{
type:Number,
},

metadata:{
type:mongoose.Schema.Types.Mixed,
},

timestamp:{
type:Date,
default:Date.now,
index:true,
},
},
{
timestamps:true,
}
);

auditLogSchema.index(
{ timestamp:1 },
{ expireAfterSeconds:7776000 }
);

export const AuditLog =
mongoose.model(
"AuditLog",
auditLogSchema
);
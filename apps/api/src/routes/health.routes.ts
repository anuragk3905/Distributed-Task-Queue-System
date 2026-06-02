import express from "express";
import mongoose from "mongoose";
import { connection } from "../config/redis.js";

const router=express.Router();

router.get("/live",(_,res)=>{
res.json({
status:"UP",
service:"api",
timestamp:new Date(),
});
});

router.get("/ready",async(_,res)=>{
try{

const mongoReady=
mongoose.connection.readyState===1;

const redisReady=
connection.status==="ready";

if(!mongoReady || !redisReady){
return res.status(503).json({
status:"NOT_READY",
mongo:mongoReady,
redis:redisReady,
});
}

res.json({
status:"READY",
mongo:true,
redis:true,
});

}catch(error){

res.status(503).json({
status:"NOT_READY",
});
}
});

import { requireAuth } from "../middleware/auth.middleware.js";

router.get("/", requireAuth, async(_,res)=>{
try{

const mongoReady=
mongoose.connection.readyState===1;

const redisReady=
connection.status==="ready";

res.status(
mongoReady && redisReady
? 200
: 503
).json({
status:
mongoReady && redisReady
? "HEALTHY"
: "UNHEALTHY",

dependencies: {
  mongodb: {
    status: mongoReady ? "UP" : "DOWN"
  },
  redis: {
    status: redisReady ? "UP" : "DOWN"
  }
},

version: process.env.npm_package_version || "1.0.0",
uptime: process.uptime(),
environment: process.env.NODE_ENV || "development",
timestamp: new Date(),
});

}catch(error){

res.status(503).json({
status:"UNHEALTHY",
});
}
});

export default router;
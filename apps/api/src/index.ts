import express from "express";
import cookieParser from "cookie-parser";
import "./config/redis.js";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/task.routes.js";
import { serverAdapter } from "./config/bullboard.js";
import "./events/queueEvents.js";
import queueRoutes from "./routes/queue.routes.js";
import cors from "cors";
import workerRoutes from "./routes/worker.routes.js";
import healthRoutes from "./routes/health.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import rateLimit from "express-rate-limit";

const app=express();

const generalLimiter=rateLimit({
windowMs:15*60*1000,
max:1000,
message:"Too many requests",
});

const taskLimiter=rateLimit({
windowMs:60*1000,
max:200,
message:"Too many task requests",
});

app.use(cors({
origin:["http://localhost:5173","https://distributed-task-queue-system.vercel.app"],
credentials:true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(generalLimiter);

connectDB();

app.use("/health",healthRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tasks",taskLimiter,taskRoutes);
app.use("/api/queues",queueRoutes);
app.use("/api/workers",workerRoutes);
app.use("/api/workflows",workflowRoutes);
app.use("/admin/queues",serverAdapter.getRouter());

app.get("/",(_,res)=>{
res.send("API Running");
});

app.listen(3000,()=>{
console.log("Server running");
});
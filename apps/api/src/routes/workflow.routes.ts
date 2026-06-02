import express from "express";
import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(requireAuth);

const reportQueue = new Queue("report-tasks", { connection });

router.post("/report", requireRole(["Admin", "Operator"]), async (req, res) => {
  try {
    const { reportType, email } = req.body;
    
    // Simulate adding a workflow job (BullMQ Flow would ideally be used here)
    const job = await reportQueue.add("generate-report", {
      reportType,
      email,
      timestamp: new Date().toISOString()
    }, {
      priority: 1
    });

    res.json({
      success: true,
      jobId: job.id,
      message: "Report workflow triggered successfully"
    });
  } catch (error) {
    console.error("Failed to trigger report workflow:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger workflow"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const waiting = await reportQueue.getWaiting(0, 100);
    const active = await reportQueue.getActive(0, 100);
    const completed = await reportQueue.getCompleted(0, 100);
    const failed = await reportQueue.getFailed(0, 100);
    const delayed = await reportQueue.getDelayed(0, 100);
    
    const jobs = [...waiting, ...active, ...completed, ...failed, ...delayed].sort((a, b) => b.timestamp - a.timestamp);
    
    const workflows = await Promise.all(jobs.map(async (job) => {
      let status = "waiting";
      if (await job.isCompleted()) status = "completed";
      else if (await job.isFailed()) status = "failed";
      else if (await job.isActive()) status = "active";
      
      const progress = typeof job.progress === 'number' ? job.progress : 0;

      let step1 = "waiting", step2 = "waiting", step3 = "waiting";

      if (status === "failed") {
        step1 = progress >= 33 ? "completed" : "failed";
        step2 = progress >= 66 ? "completed" : (progress >= 33 ? "failed" : "waiting");
        step3 = progress >= 100 ? "completed" : (progress >= 66 ? "failed" : "waiting");
      } else if (status === "completed") {
        step1 = "completed"; step2 = "completed"; step3 = "completed";
      } else if (status === "active") {
        if (progress < 33) {
          step1 = "active";
        } else if (progress < 66) {
          step1 = "completed"; step2 = "active";
        } else {
          step1 = "completed"; step2 = "completed"; step3 = "active";
        }
      }

      return {
        id: job.id,
        name: "Report Generation Flow",
        status,
        createdAt: new Date(job.timestamp).toISOString(),
        children: [
          { name: "Generate Data", status: step1 },
          { name: "Generate PDF", status: step2 },
          { name: "Send Email", status: step3 }
        ]
      };
    }));

    res.json({ success: true, workflows });
  } catch (error) {
    console.error("Failed to fetch workflows:", error);
    res.status(500).json({ success: false, message: "Failed to fetch workflows" });
  }
});

export default router;

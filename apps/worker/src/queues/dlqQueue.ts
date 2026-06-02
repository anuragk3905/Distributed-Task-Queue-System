import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

export const dlqQueue = new Queue("dead-letter", {
  connection,
});
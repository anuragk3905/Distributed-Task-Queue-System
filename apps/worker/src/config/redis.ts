import "./env.js";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL or UPSTASH_REDIS_URL is missing");
}

export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("Redis Connected");
});

connection.on("ready", () => {
  console.log("Redis Ready");
});

connection.on("error", (err) => {
  console.log("Redis Error:", err);
});
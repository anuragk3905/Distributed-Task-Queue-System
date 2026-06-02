import "./env.js";
import { Redis } from "ioredis";

const redisUrl = process.env.UPSTASH_REDIS_URL;

if (!redisUrl) {
  throw new Error("UPSTASH_REDIS_URL missing");
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
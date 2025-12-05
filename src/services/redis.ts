import Redis from "ioredis";
import dotenv from "dotenv";

// 1. Uncomment this to actually load environment variables
// dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

// 2. Fixed Typos: "REDISH" -> "REDIS" and "SERCER" -> "SERVER"
const REDIS_HOST = process.env.REDIS_SERVER_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_SERVER_PORT || "6379", 10);

console.log(`Connecting to Redis at: ${REDIS_HOST}:${REDIS_PORT}`);

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  // ioredis handles undefined values gracefully, so this is safe
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

// Optional: specific error handling to debug connection issues
redis.on("error", (err) => {
  console.error("Redis Connection Error:", err);
});

export default redis;

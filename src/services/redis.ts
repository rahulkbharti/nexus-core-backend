import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const REDISH_SERVER_HOST = process.env.REDISH_SERVER_HOST || "127.0.0.1";
const REDISH_SERCER_PORT =
  parseInt(process.env.REDISH_SERCER_PORT || "6379") || 6379;
const redis = new Redis({
  host: REDISH_SERVER_HOST, // or 'localhost'
  port: REDISH_SERCER_PORT,
});

export default redis;

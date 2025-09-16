import { Request, Response, NextFunction } from "express";

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
}

interface RateLimitRecord {
  count: number;
  startTime: number;
}

const rateLimitStore: { [ip: string]: RateLimitRecord } = {};

const rateLimiter = ({ windowMs, max }: RateLimiterOptions = {}) => {
  // Set default values if not provided
  const windowMilliseconds = windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = max || 100; // 100 requests

  return (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.user);
    // Use req.ip to identify the client. Ensure your server is configured to correctly handle proxies if needed.
    // console.log(windowMilliseconds, maxRequests);
    let ip = req.ip || "";
    const xForwardedFor = req.headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string") {
      ip = xForwardedFor.split(",")[0].trim();
    } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
      ip = xForwardedFor[0].trim();
    }
    if (!ip) {
      console.warn("Could not determine client IP for rate limiting.");
      return next();
    }
    const currentTime = Date.now();

    // Get the record for the current IP
    const record = rateLimitStore[ip];

    if (!record || currentTime - record.startTime > windowMilliseconds) {
      // If no record exists or the window has expired, create a new one
      console.log("record found:", record);
      rateLimitStore[ip] = {
        count: 1,
        startTime: currentTime,
      };
      return next();
    } else {
      // If the record exists and is within the window, increment the count
      record.count++;
      if (record.count > maxRequests) {
        // If the count exceeds the max, send a 429 Too Many Requests response
        return res.status(429).json({
          message: "Too many requests, please try again later.",
        });
      }
      return next();
    }
  };
};

export default rateLimiter;

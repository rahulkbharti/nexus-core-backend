import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mainRouter from "./routes/main.routes";
import requestLogger from "./middlewares/requestLogger.middleware";
// import rateLimit from "express-rate-limit";

dotenv.config();
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const app = express();
app.use(cors());
app.use(express.json());
// Apply the request logger to all routes
app.use(requestLogger);
app.set("trust proxy", 1);
// This will allow 100 requests per 15 minutes from a single IP.
// app.use(
//   rateLimit({
//     windowMs:
//       parseInt(process.env.REQUEST_LIMITER_WINDOW_MS || "1") * 60 * 1000,
//     max: parseInt(process.env.REQUEST_LIMITER_MAX || "10"),
//     message: "Too many requests, please try again later.",
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

app.use("/api", mainRouter);

// Simple route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Library API Server running with ESM + TypeScript");
});

// Error handling middleware
app.use(
  (err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

export default app;

import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mainRouter from "./routes/main.routes";
import requestLogger from "./middlewares/requestLogger.middleware";
import rateLimiter from "./middlewares/rateLimitor.middleware";

dotenv.config();
dotenv.config({ path: ".env.developement" });

const app = express();
app.use(cors());
app.use(express.json());
// Apply the request logger to all routes
app.use(requestLogger);
app.set("trust proxy", 1);
// This will allow 100 requests per 15 minutes from a single IP.
// console.log(
//   process.env.REQUEST_LIMITER_WINDOW_MS,
//   process.env.REQUEST_LIMITER_MAX
// );
app.use(
  rateLimiter({
    windowMs: parseInt(process.env.REQUEST_LIMITER_WINDOW_MS || "15"),
    max: parseInt(process.env.REQUEST_LIMITER_MAX || "100"),
  })
);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

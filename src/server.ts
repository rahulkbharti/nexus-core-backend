import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.developement" });

const app = express();
app.use(cors());
app.use(express.json());

// Simple route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Library API Server running with ESM + TypeScript");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

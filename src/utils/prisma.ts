import { PrismaClient } from "../generated/prisma/client";
import dotenv from "dotenv";
console.log("I am Running In Prisma.ts");
dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

// console.log(
//   "Using environment file:",
//   process.env.ENV_FILE,
//   process.env.DATABASE_URL
// );
const prisma = new PrismaClient();

export default prisma;

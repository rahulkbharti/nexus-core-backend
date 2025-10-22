import dotenv from "dotenv";
import { describe, it } from "node:test";
import { expect } from "vitest";
// dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

console.log("Environment Variables:", process.env);
// dotenv.config({ path: ".env" });
describe("Environment Variables", () => {
  it("should load NODE_ENV from .env file", () => {
    console.log("NODE_ENV:", process.env.NODE_ENV);
    expect(process.env.NODE_ENV).toBe("production");
  });
});

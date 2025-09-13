import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import redis from "../services/redis";
// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.time("Auth Middleware Execution Time");
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const isRevoked = await redis.get(`access_token:${token}:revoked`);
    if (isRevoked) {
      // console.timeEnd("Auth Middleware Execution Time");
      return res.status(401).json({ message: "Token Revoked" });
    }
    const userData = await verifyAccessToken(token);
    if (userData) {
      req.user = userData;
      if (req.user && req.user.permissions_updated_at) {
        const checkForUpdate = await redis.get(
          `permissions_updated_at:${req.user.organizationId}`
        );
        if (
          req.user.role !== "ADMIN" &&
          checkForUpdate &&
          parseInt(checkForUpdate) > req.user.permissions_updated_at
        ) {
          return res
            .status(401)
            .json({ message: "Permissions Updated : Login Again" });
        }
      }
      next();
    } else {
      // console.timeEnd("Auth Middleware Execution Time");
      res.status(401).json({ message: "Token Expired" });
    }
  } else {
    // console.timeEnd("Auth Middleware Execution Time");
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const checkPermissions = (
  required: string[],
  permissions: string[]
): { granted: boolean; missing: string[] } => {
  const missing = required.filter((perm) => !permissions.includes(perm));
  return {
    granted: missing.length === 0,
    missing,
  };
};

export const authorization = (required_permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log("Authorization Middleware Invoked", required_permissions);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    } else if (req.user.role === "ADMIN") {
      return next();
    } else if (req.user.role === "STAFF") {
      const { granted, missing } = checkPermissions(
        required_permissions,
        req.user.permissions
      );
      if (granted) {
        next();
        return;
      }
      res
        .status(403)
        .json({ message: "Forbidden: Missing permissions", missing });
    } else {
      res.status(403).json({ message: "Forbidden: Invalid role" });
    }
  };
};

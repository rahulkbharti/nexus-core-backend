import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import prisma from "../utils/prisma";
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
  console.time("Auth Middleware Execution Time");
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const userData = await verifyAccessToken(token);
    if (userData) {
      req.user = userData;
      console.log("User Data in Middleware:", req.user);
      next();
    } else {
      console.timeEnd("Auth Middleware Execution Time");
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    console.timeEnd("Auth Middleware Execution Time");
    res.status(401).json({ message: "Unauthorized" });
  }
};

const checkStaffPermission = async (userId: number, permission: string) => {
  const staff = await prisma.staff.findUnique({
    where: { userId },
    include: { directPermissions: { select: { name: true } } },
  });
  // console.log("Staff Permissions:", staff);
  if (staff) {
    const permissions = staff.directPermissions.find(
      (perm) => perm.name === permission
    );
    if (permissions) {
      console.log(`Staff has permission: ${permission}`);
      return true;
    }
  }
  console.log(`Staff does not have permission: ${permission}`);
  return false;
};

export const authorization = (required_permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Authorization Middleware Invoked", required_permissions);
    if (req.user) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (user && user.role === "ADMIN") {
        console.log("Admin Access Granted");
        next();
      } else if (user && user.role === "STAFF") {
        const hasPermission = await checkStaffPermission(
          req.user.id,
          required_permissions[0]
        );
        if (hasPermission) {
          console.log("Staff Access Granted");
          next();
        } else {
          console.log("Access Denied: Insufficient Permissions");
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        console.log("Access Denied: Insufficient Permissions");
        res.status(403).json({ message: "Forbidden" });
      }
    }
  };
};

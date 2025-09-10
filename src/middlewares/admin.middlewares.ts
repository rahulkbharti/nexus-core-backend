import { Request, Response, NextFunction } from "express";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      role: string;
      // add other user properties if needed
    }
    interface Request {
      user?: any;
    }
  }
}

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log(req.user);
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Only Admin can access this resource" });
  }
};

export default adminMiddleware;

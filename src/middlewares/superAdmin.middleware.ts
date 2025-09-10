import { Request, Response, NextFunction } from "express";

interface User {
  superAdmin: boolean;
  // add other user properties if needed
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

const superAdminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("TODO: Will Implement Logic For Super Admin");
  next();
};

export default superAdminMiddleware;

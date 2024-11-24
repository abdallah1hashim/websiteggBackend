import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import jsonwebtoken from "jsonwebtoken";
import { Roles } from "../rbacConfig";

export const isAutenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get("Authorization");
  let decodedToken;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    decodedToken = verify(
      token.split(" ")[1],
      process.env.JWT_SECRET_KEY as string
    ) as any;
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  req.userId = decodedToken.id;
  req.userRole = decodedToken.role;
  next();
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.userRole === "admin"
    ? next()
    : res.status(401).json({ message: "Unauthorized" });
};
export const isAdminORStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.userRole === "admin" || req.userRole === "staff"
    ? next()
    : res.status(401).json({ message: "Unauthorized" });
};
export const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.userRole; // Assumes user role is set in `req.userRole`
      if (!role) {
        throw new Error("Role not defined");
      }

      const permissions = Roles[role];
      if (!permissions || !permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next(); // User has the required permission
    } catch (err) {
      next(err);
    }
  };
};

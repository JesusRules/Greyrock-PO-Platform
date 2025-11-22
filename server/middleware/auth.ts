import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User as UserType } from "../../types/User.js";
import User from "../models/User.js";
import type { RequestHandler } from "express";

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
    user?: Omit<UserType, "password">;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const user = await User.findById(decoded.id).select(
      "-password"
    ).lean<UserType>();

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
export const requireAdmin: RequestHandler = (req, res, next) => {
  const authReq = req as AuthRequest;

  if (!authReq.user || authReq.user.role !== "admin") {
    res.status(403).json({ message: "Admin access only" });
    return; // <- returns void, not Response
  }

  next();
};
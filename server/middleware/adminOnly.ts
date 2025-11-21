import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Admins only" });
      return;
    }
    next();
};
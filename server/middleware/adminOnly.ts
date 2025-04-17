import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "Admin") {
      res.status(403).json({ message: "Admins only" });
      return;
    }
    next();
};
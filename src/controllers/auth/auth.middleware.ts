import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.service";
import type { JwtPayload } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Optional middleware to protect routes. Expects:
 * Authorization: Bearer <token>
 * Sets req.user with JWT payload (userId, email).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, message: "Authorization token required" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  req.user = payload;
  next();
}

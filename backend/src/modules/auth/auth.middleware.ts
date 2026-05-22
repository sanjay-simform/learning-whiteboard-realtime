import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    });
    return;
  }

  const authService = new AuthService();
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }

  req.user = decoded;
  next();
};

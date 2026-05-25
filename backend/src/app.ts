import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { authenticateToken, authRoutes } from "modules/auth";
import boardRouter from "modules/board/board.route";
import profileRouter from "modules/profile/profile.route";
import { userRoutes } from "modules/users";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/profile", authenticateToken, profileRouter);
app.use("/board", authenticateToken, boardRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;

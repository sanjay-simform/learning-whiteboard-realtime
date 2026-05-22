import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Missing required fields:username, password",
        });
        return;
      }

      // Validate password length
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
        return;
      }

      // Call auth service
      const result = await this.authService.register(username, password);

      if (!result.success) {
        res.status(409).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.log("Register error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: email, password",
        });
        return;
      }

      // Call auth service
      const result = await this.authService.login(username, password);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }
}

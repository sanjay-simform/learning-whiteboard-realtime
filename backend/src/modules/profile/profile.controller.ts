import { UserService } from "modules/users";
import { Request, Response } from "express";

export class ProfileController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const profile = await this.userService.getUserById(userId);
      const response = {
        id: profile?.id,
        username: profile?.username,
        createdAt: profile?.createdAt,
      };
      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        message: error?.message || "Failed to fetch profile",
      });
    }
  }
}

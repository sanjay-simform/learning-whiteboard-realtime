import { UserService } from "modules/users";
import { boardSocket, BoardSocket } from "./board-websocket";
import { type Request, type Response } from "express";

export class BoardController {
  private boardSocket: BoardSocket;
  private userService: UserService;
  constructor() {
    this.boardSocket = boardSocket;
    this.userService = new UserService();
  }

  async currentBoardMembers(req: Request, res: Response) {
    try {
      const currentUserId = req.user.userId;
      const boardId = parseInt(String(req.params.boardId), 10);

      const members = this.boardSocket.getSubscribers(boardId);
      if (!members.has(currentUserId)) {
        return res.json([]);
      }
      const users = await this.userService.getUsersByIds(Array.from(members));
      const response = users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
      }));
      res.json({ users: response });
    } catch (error) {
      return res.status(500).json({
        message: error?.message || "Failed to fetch profile",
      });
    }
  }
}

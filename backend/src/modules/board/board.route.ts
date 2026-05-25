import { Router } from "express";
import { BoardController } from "./board.controller";

const boardRouter = Router();
const boardController = new BoardController();

// board routes
boardRouter.get("/:boardId/current-members", (req, res) =>
  boardController.currentBoardMembers(req, res),
);

export default boardRouter;

import { Router } from "express";
import { ProfileController } from "./profile.controller";

const profileRouter = Router();
const profileController = new ProfileController();

// Profile routes
profileRouter.get("/", (req, res) => profileController.getProfile(req, res));

export default profileRouter;

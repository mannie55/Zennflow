import express from "express";
import authController from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.post("/google", authController.googleLogin);

export default authRouter;

import express from "express";
import userController from "../controllers/users.js";

const usersRouter = express.Router();

usersRouter.post("/register", userController.register);
usersRouter.post("/login", userController.login);

export default usersRouter;

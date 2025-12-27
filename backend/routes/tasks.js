import express from "express";
import taskController from "../controllers/tasks.js";
import { userExtractor } from "../utils/middleware.js";

const tasksRouter = express.Router();

// GET all tasks for the logged-in user
tasksRouter.get("/", userExtractor, taskController.getAllTasks);

// SYNC tasks for the logged-in user
tasksRouter.post("/sync", userExtractor, taskController.syncTasks);

// DELETE a task by id
tasksRouter.delete("/:id", userExtractor, taskController.deleteTask);

export default tasksRouter;

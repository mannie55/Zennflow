import express from "express";
import taskController from "../controllers/tasks.js";
import { userExtractor } from "../utils/middleware.js";

const tasksRouter = express.Router();

// GET all tasks for the logged-in user
tasksRouter.get("/", userExtractor, taskController.getAllTasks);

// POST a new task for the logged-in user
tasksRouter.post("/", userExtractor, taskController.createTask);

// DELETE a task by id
tasksRouter.delete("/:id", userExtractor, taskController.deleteTask);

// UPDATE a task by id
tasksRouter.put("/:id", userExtractor, taskController.updateTask);

export default tasksRouter;

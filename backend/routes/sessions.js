import express from "express";
import sessionController from "../controllers/sessions.js";
import { userExtractor } from "../utils/middleware.js";

const sessionsRouter = express.Router();

// GET all sessions for the logged-in user
sessionsRouter.get("/", userExtractor, sessionController.getAllSessions);

// POST (start) a new session for the logged-in user
sessionsRouter.post("/", userExtractor, sessionController.startSession);

// PUT (update) a session by id
sessionsRouter.put("/:id", userExtractor, sessionController.updateSession);

// DELETE a session by id
sessionsRouter.delete("/:id", userExtractor, sessionController.deleteSession);

export default sessionsRouter;

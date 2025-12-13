import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import dotenv from "dotenv";
import {
  requestLogger,
  tokenExtractor,
  unknownEndpoint,
  errorHandler,
} from "./utils/middleware.js";
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import authRouter from "./routes/auth.js";
import sessionsRouter from "./routes/sessions.js";
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(requestLogger);
app.use(tokenExtractor);

app.use("/api/users", usersRouter);
app.use("/api/tasks", tasksRouter);
// app.use("/api/auth", authRouter); // Google Sign-In route disabled for now
app.use("/api/sessions", sessionsRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;

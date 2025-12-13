import jwt from "jsonwebtoken";
import logger from "./logger.js";
import { request } from "express";

export const asyncHandler = (fn) => (request, response, next) => {
  Promise.resolve(fn(request, response, next)).catch(next);
};

export const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  }
  next();
};

export const userExtractor = (request, response, next) => {
  try {
    if (!request.token) {
      return response.status(401).json({ error: "token missing" });
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    request.user = decodedToken;
    next();
  } catch (err) {
    next(err);
  }
};

export const requestLogger = (request, response, next) => {
  const start = Date.now();

  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);

  if (!request.body) {
    logger.info("Body: empty");
  } else {
    logger.info("Body:  ", request.body);
  }

  response.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`Status:  ${response.statusCode}`);
    logger.info(`Duration: ${duration}ms`);
    logger.info("---");
  });

  next();
};

export const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

export const errorHandler = (err, request, response, next) => {
  logger.error(err);

  const errorStatusMap = {
    "title is missing": 400,
    "duration is required": 400,
    "password must be at least 8 characters long": 400,
    "username and password are required": 400,
    "invalid username or password": 401,
    "User not authorized to delete this task": 403,
    "User not authorized to update this task": 403,
    "User not authorized to update this session": 403,
    "User not authorized to delete this session": 403,
    "Task not found": 404,
    "Task not found or user not authorized": 404,
    "Session not found": 404,
  };

  if (errorStatusMap[err.message]) {
    return response
      .status(errorStatusMap[err.message])
      .json({ error: err.message });
  }

  if (err.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return response.status(400).json({ error: err.message });
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    // Extract the field that caused the error
    const field = Object.keys(err.keyValue)[0];
    return response
      .status(400)
      .json({ error: `An account with that ${field} already exists.` });
  } else if (err.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  } else if (err.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired",
    });
  }

  next(err);
};

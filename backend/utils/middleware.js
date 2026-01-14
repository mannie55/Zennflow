import jwt from "jsonwebtoken";
import logger from "./logger.js";

/**
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => (request, response, next) => {
  Promise.resolve(fn(request, response, next)).catch(next);
};

/**
 * Extracts JWT token from Authorization header
 */
export const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  }
  next();
};

/**
 * Verifies JWT token and attaches user to request
 * Returns 401 if token is missing
 */
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

/**
 * Logs HTTP request details with timing
 */
export const requestLogger = (request, response, next) => {
  const start = Date.now();

  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);

  if (Object.keys(request.body).length === 0) {
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

/**
 * Returns 404 for unknown endpoints
 */
export const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: "unknown endpoint" });
};

/**
 * Global error handler with proper HTTP status codes
 */
export const errorHandler = (err, request, response, next) => {
  logger.error(err.message);

  // Map error messages to HTTP status codes
  const errorStatusMap = {
    "token missing": 401,
    "token invalid": 401,
    "token expired": 401,
    "invalid username or password": 401,
    "User not authorized to delete this task": 403,
    "User not authorized to update this task": 403,
    "User not authorized to update this session": 403,
    "User not authorized to delete this session": 403,
    "User ID is required": 400,
    "Task ID is required": 400,
    "Task not found": 404,
    "Task not found or user not authorized": 404,
    "Session not found": 404,
    "password must be at least 8 characters long": 400,
    "username and password are required": 400,
    "duration is required": 400,
  };

  // Check error message mapping
  if (errorStatusMap[err.message]) {
    return response.status(errorStatusMap[err.message]).json({
      error: err.message,
    });
  }

  // Handle specific error types
  if (err.name === "CastError") {
    return response.status(400).json({ error: "malformatted id" });
  }

  if (err.name === "ValidationError") {
    return response.status(400).json({ error: err.message });
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return response.status(400).json({
      error: `An account with that ${field} already exists.`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  }

  if (err.name === "TokenExpiredError") {
    return response.status(401).json({ error: "token expired" });
  }

  // Default to 500 for unknown errors
  response.status(500).json({
    error: "internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

import Session from "../models/session.js";
import Task from "../models/task.js";
import logger from "../utils/logger.js";

/**
 * Get all sessions for a user
 */
const getAllSessions = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await Session.find({ user: userId })
    .sort({ startTime: -1 })
    .populate("task", "description completed");
};

/**
 * Start a new session
 */
const startSession = async (userId, { duration, taskId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!duration || typeof duration !== "number" || duration < 1) {
    throw new Error("duration is required and must be a positive number");
  }

  // Validate task if provided
  if (taskId) {
    const task = await Task.findOne({ user: userId, id: taskId });
    if (!task) {
      throw new Error("Task not found or user not authorized");
    }
  }

  const session = new Session({
    duration,
    startTime: new Date(),
    focusedTime: 0,
    completed: false,
    user: userId,
    task: taskId || null,
  });

  const savedSession = await session.save();
  return savedSession.toJSON();
};

/**
 * Update a session (e.g., at the end of a pomodoro)
 */
const updateSession = async (userId, sessionId, updateData) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const sessionToUpdate = await Session.findById(sessionId);

  if (!sessionToUpdate) {
    throw new Error("Session not found");
  }

  if (sessionToUpdate.user.toString() !== userId) {
    throw new Error("User not authorized to update this session");
  }

  // Validate focusedTime if provided
  if (
    updateData.focusedTime !== undefined &&
    (typeof updateData.focusedTime !== "number" || updateData.focusedTime < 0)
  ) {
    throw new Error("focusedTime must be a non-negative number");
  }

  const finalUpdateData = {
    ...updateData,
    endTime: updateData.completed ? new Date() : sessionToUpdate.endTime,
  };

  const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    finalUpdateData,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedSession.toJSON();
};

/**
 * Delete a session
 */
const deleteSession = async (userId, sessionId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.user.toString() !== userId) {
    throw new Error("User not authorized to delete this session");
  }

  await Session.findByIdAndDelete(sessionId);
  logger.info(`Session deleted: ${sessionId}`);
};

export default {
  getAllSessions,
  startSession,
  updateSession,
  deleteSession,
};

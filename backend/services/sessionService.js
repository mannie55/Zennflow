import Session from "../models/session.js";
import Task from "../models/task.js";

const getAllSessions = async (userId) => {
  return await Session.find({ user: userId }).populate("task", {
    title: 1,
    completed: 1,
  });
};

const startSession = async (userId, { duration, taskId }) => {
  if (!duration) {
    throw new Error("duration is required");
  }

  if (taskId) {
    const task = await Task.findById(taskId);
    if (!task || task.user.toString() !== userId) {
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

  return await session.save();
};

const updateSession = async (userId, sessionId, updateData) => {
  const sessionToUpdate = await Session.findById(sessionId);

  if (!sessionToUpdate) {
    throw new Error("Session not found");
  }

  if (sessionToUpdate.user.toString() !== userId) {
    throw new Error("User not authorized to update this session");
  }

  const finalUpdateData = {
    ...updateData,
    endTime: updateData.completed ? new Date() : sessionToUpdate.endTime,
  };

  return await Session.findByIdAndUpdate(sessionId, finalUpdateData, {
    new: true,
    runValidators: true,
  });
};

const deleteSession = async (userId, sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.user.toString() !== userId) {
    throw new Error("User not authorized to delete this session");
  }

  await Session.findByIdAndDelete(sessionId);
};

export default {
  getAllSessions,
  startSession,
  updateSession,
  deleteSession,
};

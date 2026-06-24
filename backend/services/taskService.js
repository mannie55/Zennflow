import Task from "../models/task.js";
import logger from "../utils/logger.js";

/**
 * Get all tasks for a user
 */
const getAllTasks = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await Task.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * Delete a task by id
 */
const deleteTask = async (userId, taskId) => {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const task = await Task.findOne({ user: userId, id: taskId });

  if (!task) {
    throw new Error("Task not found");
  }

  await Task.deleteOne({ user: userId, id: taskId });
};

/**
 * Sync tasks using offline-first pattern
 * Handles batch creation and updates with timestamp-based conflict resolution
 */
const syncTasks = async (userId, incomingTasks) => {
  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
    };
  }

  if (!Array.isArray(incomingTasks)) {
    return {
      success: false,
      message: "Request body must be an array of tasks.",
    };
  }

  // Filter out tasks with no id field
  const incomingTaskIds = incomingTasks.map((t) => t.id).filter((id) => id);

  if (incomingTaskIds.length === 0) {
    return {
      success: true,
      created: [],
      updated: [],
      failed: incomingTasks.map((t) => ({
        task: t,
        reason: "Missing required id field.",
      })),
    };
  }

  // Fetch existing tasks for this user
  const existingTasks = await Task.find({
    user: userId,
    id: { $in: incomingTaskIds },
  });

  const existingTasksMap = new Map(existingTasks.map((t) => [t.id, t]));
  const tasksToInsert = [];
  const updateOperations = [];
  const tasksToDelete = [];
  const failedTasks = [];

  for (const incomingTask of incomingTasks) {
    // If marked for deletion, collect id and skip other checks
    if (incomingTask.deleted === true) {
      if (incomingTask.id) {
        tasksToDelete.push(incomingTask.id);
      } else {
        failedTasks.push({
          task: incomingTask,
          reason: "Missing required field: id for deletion.",
        });
      }
      continue;
    }

    // Validate required fields
    if (!incomingTask.id) {
      failedTasks.push({
        task: incomingTask,
        reason: "Missing required field: id.",
      });
      continue;
    }

    if (
      incomingTask.updated_at === undefined ||
      incomingTask.updated_at === null
    ) {
      failedTasks.push({
        task: incomingTask,
        reason: "Missing required field: updated_at.",
      });
      continue;
    }

    if (
      incomingTask.createdAt === undefined ||
      incomingTask.createdAt === null
    ) {
      failedTasks.push({
        task: incomingTask,
        reason: "Missing required field: createdAt.",
      });
      continue;
    }

    // Validate field types
    if (typeof incomingTask.id !== "string") {
      failedTasks.push({
        task: incomingTask,
        reason: "Field 'id' must be a string.",
      });
      continue;
    }

    if (typeof incomingTask.completed !== "boolean") {
      failedTasks.push({
        task: incomingTask,
        reason: "Field 'completed' must be a boolean.",
      });
      continue;
    }

    const taskData = {
      id: incomingTask.id,
      description: incomingTask.description || "",
      completed: incomingTask.completed,
      client_updated_at: new Date(incomingTask.updated_at),
      createdAt: new Date(incomingTask.createdAt),
      user: userId,
    };

    const existingTask = existingTasksMap.get(incomingTask.id);

    if (!existingTask) {
      // New task - insert it
      tasksToInsert.push(taskData);
    } else {
      // Existing task - check timestamps for conflict resolution
      const incomingTimestamp = new Date(incomingTask.updated_at);
      if (incomingTimestamp > existingTask.client_updated_at) {
        // Client's version is newer - update
        const { createdAt, id, user, ...updateData } = taskData;
        updateOperations.push({
          updateOne: {
            filter: { id: incomingTask.id, user: userId },
            update: { $set: updateData },
          },
        });
      }
      // If client's version is older or equal, silently ignore (no error)
    }
  }

  const results = {
    created: [],
    updated: [],
    deleted: [],
  };

  try {
    if (tasksToDelete.length > 0) {
      await Task.deleteMany({ user: userId, id: { $in: tasksToDelete } });
      results.deleted = tasksToDelete;
      logger.info(`Sync: Deleted ${tasksToDelete.length} tasks`);
    }

    if (tasksToInsert.length > 0) {
      const inserted = await Task.insertMany(tasksToInsert, {
        ordered: false,
      });
      results.created = inserted.map((t) => t.id);
      logger.info(`Sync: Created ${inserted.length} tasks`);
    }

    if (updateOperations.length > 0) {
      const bulkResult = await Task.bulkWrite(updateOperations, {
        ordered: false,
      });
      results.updated = updateOperations.map((op) => op.updateOne.filter.id);
      logger.info(`Sync: Updated ${bulkResult.modifiedCount} tasks`);
    }
  } catch (error) {
    logger.error("Sync error:", error.message);
    return {
      success: false,
      message: "An error occurred during synchronization.",
      error: error.message,
    };
  }

  return {
    success: true,
    ...results,
    failed: failedTasks,
  };
};

export default {
  getAllTasks,
  deleteTask,
  syncTasks,
};

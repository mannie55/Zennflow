import taskService from "../services/taskService.js";
import { asyncHandler } from "../utils/middleware.js";

/**
 * Get all tasks for the logged-in user
 * @route GET /api/tasks
 * @access Private
 */
const getAllTasks = asyncHandler(async (request, response) => {
  const tasks = await taskService.getAllTasks(request.user.id);
  response.status(200).json(tasks);
});

/**
 * Delete a task by id
 * @route DELETE /api/tasks/:id
 * @access Private
 */
const deleteTask = asyncHandler(async (request, response) => {
  const taskId = request.params.id;
  await taskService.deleteTask(request.user.id, taskId);
  response.status(204).end();
});

/**
 * Sync tasks using offline-first pattern
 * Handles creation, updates, and deletion of tasks in batch
 * @route POST /api/tasks/sync
 * @access Private
 */
const syncTasks = asyncHandler(async (request, response) => {
  const tasks = request.body;
  const userId = request.user.id;

  if (!Array.isArray(tasks)) {
    return response.status(400).json({
      error: "Request body must be an array of tasks.",
    });
  }

  const result = await taskService.syncTasks(userId, tasks);

  if (!result.success) {
    return response.status(500).json({
      error: result.message,
      details: result.error,
    });
  }

  response.status(200).json(result);
});

export default {
  getAllTasks,
  deleteTask,
  syncTasks,
};

import taskService from "../services/taskService.js";
import { asyncHandler } from "../utils/middleware.js";

const getAllTasks = asyncHandler(async (request, response) => {
  // The user object is attached to the request by the userExtractor middleware
  const tasks = await taskService.getAllTasks(request.user.id);
  response.json(tasks);
});

const createTask = asyncHandler(async (request, response) => {
  const { title, description } = request.body;
  const savedTask = await taskService.createTask(request.user.id, {
    title,
    description,
  });
  response.status(201).json(savedTask);
});

const deleteTask = asyncHandler(async (request, response) => {
  const taskId = request.params.id;
  await taskService.deleteTask(request.user.id, taskId);
  response.status(204).end();
});

const updateTask = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { title, description, completed } = request.body;

  const updatedTask = await taskService.updateTask(request.user.id, id, {
    title,
    description,
    completed,
  });
  response.json(updatedTask);
});

const syncTasks = asyncHandler(async (request, response) => {
  const tasks = request.body;
  const userId = request.user.id;

  if (!Array.isArray(tasks)) {
    return response
      .status(400)
      .json({ error: "Request body must be an array of tasks." });
  }

  const result = await taskService.syncTasks(userId, tasks);

  if (!result.success) {
    // A 500 status might be too general, but it's a safe default for server-side failures.
    return response
      .status(500)
      .json({ error: result.message, details: result.error });
  }

  // A 200 OK is appropriate for a successful sync, which can include partial failures.
  response.status(200).json(result);
});

export default {
  getAllTasks,
  createTask,
  deleteTask,
  updateTask,
  syncTasks,
};

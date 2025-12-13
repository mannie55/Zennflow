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

export default {
  getAllTasks,
  createTask,
  deleteTask,
  updateTask,
};

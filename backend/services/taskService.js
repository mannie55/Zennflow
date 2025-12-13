import Task from "../models/task.js";

const getAllTasks = async (userId) => {
  return await Task.find({ user: userId });
};

const createTask = async (userId, { title, description }) => {
  if (!title) {
    throw new Error("title is missing");
  }

  const task = new Task({
    title,
    description: description || null,
    completed: false,
    user: userId,
  });

  return await task.save();
};

const deleteTask = async (userId, taskId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.user.toString() !== userId) {
    throw new Error("User not authorized to delete this task");
  }

  await Task.findByIdAndDelete(taskId);
};

const updateTask = async (userId, taskId, updateData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.user.toString() !== userId) {
    throw new Error("User not authorized to update this task");
  }

  return await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true,
  });
};

export default { getAllTasks, createTask, deleteTask, updateTask };

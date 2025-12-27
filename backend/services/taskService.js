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

const syncTasks = async (userId, incomingTasks) => {
  if (!Array.isArray(incomingTasks)) {
    return {
      success: false,
      message: 'Invalid request: incomingTasks must be an array.',
    };
  }

  const incomingTaskIds = incomingTasks.map((t) => t.id).filter(id => id);

  if (incomingTaskIds.length === 0) {
    return {
      success: true,
      message: 'No tasks with IDs to sync.',
      created: [],
      updated: [],
      failed: [],
    };
  }

  const existingTasks = await Task.find({
    user: userId,
    id: { $in: incomingTaskIds },
  });

  const existingTasksMap = new Map(existingTasks.map((t) => [t.id, t]));
  const tasksToInsert = [];
  const updateOperations = [];
  const failedTasks = [];

  for (const incomingTask of incomingTasks) {
    // Basic validation for core fields
    if (!incomingTask.id || !incomingTask.updated_at || !incomingTask.createdAt) {
      failedTasks.push({ task: incomingTask, reason: 'Missing required fields (id, updated_at, createdAt).' });
      continue;
    }

    const taskData = {
      id: incomingTask.id,
      description: incomingTask.description,
      completed: incomingTask.completed,
      client_updated_at: new Date(incomingTask.updated_at),
      createdAt: new Date(incomingTask.createdAt),
      user: userId,
    };

    const existingTask = existingTasksMap.get(incomingTask.id);

    if (!existingTask) {
      tasksToInsert.push(taskData);
    } else {
      const incomingTimestamp = new Date(incomingTask.updated_at);
      if (incomingTimestamp > existingTask.client_updated_at) {
        // Ensure immutable fields are not updated
        const { createdAt, id, user, ...updateData } = taskData;
        updateOperations.push({
          updateOne: {
            filter: { id: incomingTask.id, user: userId },
            update: { $set: updateData },
          },
        });
      }
    }
  }

  const results = {
    created: [],
    updated: [],
  };

  try {
    if (tasksToInsert.length > 0) {
      const inserted = await Task.insertMany(tasksToInsert, { ordered: false });
      results.created = inserted.map(t => t.id);
    }

    if (updateOperations.length > 0) {
      const bulkResult = await Task.bulkWrite(updateOperations, { ordered: false });
      if (bulkResult.isOk()) {
        results.updated = updateOperations.map(op => op.updateOne.filter.id);
      }
    }
  } catch (error) {
    // Basic error handling. In a real app, you'd want more specific logic
    // to identify which specific tasks failed during batch operations.
    return {
      success: false,
      message: 'An error occurred during synchronization.',
      error: error.message,
    };
  }

  return {
    success: true,
    ...results,
    failed: failedTasks,
  };
};


export default { getAllTasks, createTask, deleteTask, updateTask, syncTasks };

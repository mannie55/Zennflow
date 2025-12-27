// A set of functions for interacting with chrome.storage.local.
// This service provides the core logic for the "Local-First" data layer.

/**
 * Retrieves all non-deleted tasks from local storage.
 * @returns {Promise<Array>} A promise that resolves to the array of tasks.
 */
const getAllTasks = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get({ tasks: [] }, (result) => {
      // Filter out tasks that are marked for deletion
      const activeTasks = result.tasks.filter(task => !task.deleted);
      resolve(activeTasks);
    });
  });
};

/**
 * Adds a new task to the tasks array in local storage.
 * @param {object} taskData - The task object to be added, without id, updated_at, or synced status.
 * @returns {Promise<object>} A promise that resolves to the new task object.
 */
const createTask = (taskData) => {
  return new Promise((resolve) => {
    // We get all tasks including deleted ones to perform the update
    chrome.storage.local.get({ tasks: [] }, (result) => {
      const newTask = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: false,
      };
      const updatedTasks = [...result.tasks, newTask];
      chrome.storage.local.set({ tasks: updatedTasks }, () => {
        resolve(newTask);
      });
    });
  });
};

/**
 * Updates an existing task in local storage.
 * @param {string} id - The ID of the task to update.
 * @param {object} updates - The updated task data.
 * @returns {Promise<object>}
 */
const updateTask = (id, updates) => {
  return new Promise((resolve) => {
    // We get all tasks including deleted ones to perform the update
    chrome.storage.local.get({ tasks: [] }, (result) => {
      const updatedTasks = result.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updated_at: new Date().toISOString(),
              synced: false,
            }
          : task
      );
      chrome.storage.local.set({ tasks: updatedTasks }, () => {
        const updatedTask = updatedTasks.find((task) => task.id === id);
        resolve(updatedTask);
      });
    });
  });
};

/**
 * Marks a task for deletion in local storage (soft delete).
 * @param {string} id - The ID of the task to delete.
 * @returns {Promise<void>}
 */
const deleteTask = (id) => {
  return new Promise((resolve) => {
    // We get all tasks including deleted ones to perform the update
    chrome.storage.local.get({ tasks: [] }, (result) => {
      const updatedTasks = result.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              deleted: true,
              updated_at: new Date().toISOString(),
              synced: false,
            }
          : task
      );
      chrome.storage.local.set({ tasks: updatedTasks }, () => {
        resolve();
      });
    });
  });
};

export default {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};

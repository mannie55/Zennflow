// src/background.js
import taskApi from "./apiService/task.js";

// === INITIAL HYDRATION ===

/**
 * Fetches all tasks from the backend and populates local storage if it's empty.
 * This is crucial for when the extension is installed on a new device.
 */
const seedDataFromBackend = async () => {
  const localData = await chrome.storage.local.get({ tasks: [] });

  // Only seed data if the local storage is empty
  if (localData.tasks.length === 0) {
    console.log("Local storage is empty. Seeding data from backend...");
    try {
      const backendTasks = await taskApi.getAll();
      if (backendTasks && backendTasks.length > 0) {
        // Mark all fetched tasks as synced before storing them
        const tasksToStore = backendTasks.map(task => ({ ...task, synced: true }));
        await chrome.storage.local.set({ tasks: tasksToStore });
        console.log(`Successfully seeded ${tasksToStore.length} tasks from the backend.`);
      } else {
        console.log("Backend has no tasks to seed.");
      }
    } catch (error) {
      console.error("Failed to seed data from backend:", error);
      // If seeding fails, the app will just start in a clean state.
      // An alternative would be to retry, but that could lead to a loop on first start
      // if the backend is down.
    }
  } else {
    console.log("Local storage already has data. Skipping seed.");
    // If there's local data, we prioritize it (local-first) and sync any unsynced changes.
    syncAllUnsyncedTasks();
  }
};


// === GLOBAL SYNC TRIGGER ===

/**
 * The main function to trigger a full sync of all unsynced tasks.
 * It gets all tasks, finds the ones that need syncing, and processes them.
 */
const syncAllUnsyncedTasks = async () => {
  console.log("Checking for unsynced tasks...");
  const allTasks = (await chrome.storage.local.get({ tasks: [] })).tasks;
  const unsyncedTasks = allTasks.filter((task) => !task.synced);

  if (unsyncedTasks.length > 0) {
    console.log(`Found ${unsyncedTasks.length} unsynced tasks. Syncing now...`);
    // Process tasks one by one to avoid race conditions
    for (const task of unsyncedTasks) {
      await syncTask(task);
    }
    console.log("Finished sync cycle.");
  } else {
    console.log("All tasks are up to date.");
  }
};

// === EVENT LISTENERS ===

chrome.runtime.onInstalled.addListener(() => {
  console.log("Focusflow Extension successfully installed.");
  seedDataFromBackend(); // Attempt to seed data on first install
});

// Sync when the extension starts up
chrome.runtime.onStartup.addListener(() => {
  console.log("Browser startup detected. Triggering seed/sync.");
  seedDataFromBackend(); // Attempt to seed data on startup
});

// Sync when a change is made to the tasks
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.tasks) {
    console.log("Storage change detected. Triggering sync.");
    // We call the main sync function rather than trying to be clever about the change.
    // The syncTask function is idempotent, so this is safe.
    syncAllUnsyncedTasks();
  }
});

// Sync when the browser comes back online
self.addEventListener("online", () => {
  console.log("Browser came online. Triggering sync.");
  syncAllUnsyncedTasks();
});


// === CORE SYNC LOGIC ===

/**
 * Orchestrates the synchronization of a single task with the backend.
 * It handles creation, updates, and deletion.
 * @param {object} task The task object to sync.
 */
const syncTask = async (task) => {
  // Get the most recent state of all tasks before proceeding
  let allTasks = (await chrome.storage.local.get({ tasks: [] })).tasks;
  const taskIndex = allTasks.findIndex((t) => t.id === task.id);
  
  // The task might have been deleted and hard-removed by another sync cycle
  // while this one was in progress.
  if (taskIndex === -1) {
    console.log(`Task ${task.id} no longer exists locally. Skipping sync.`);
    return;
  }

  // Also, the task might have been updated and synced by another process.
  // Re-check the synced flag on the latest version of the task.
  if (allTasks[taskIndex].synced) {
     console.log(`Task ${task.id} is already synced. Skipping sync.`);
     return;
  }

  // Case 1: Task is marked for deletion
  if (task.deleted) {
    console.log("Attempting to delete task from backend:", task);
    const response = await taskApi.remove(task);
    if (response.status === 200) {
      console.log("Backend deletion successful. Hard deleting locally:", task.id);
      allTasks.splice(taskIndex, 1); // Permanently remove from local storage
    } else {
      console.error("Failed to delete task on backend. Status:", response.status, "Response:", response.data);
      return; // Do not update storage, let it retry
    }
  } else {
    // Case 2: Task is created or updated
    const checkResponse = await taskApi.getById(task.id);

    if (checkResponse.status === 404) {
      // Task does not exist on backend, so create it
      console.log("Task not found on backend. Creating:", task);
      const createResponse = await taskApi.create(task);
      if (createResponse.status === 201) {
        allTasks[taskIndex] = { ...createResponse.data, synced: true };
        console.log("Task created and synced:", allTasks[taskIndex]);
      } else {
        console.error("Failed to create task on backend:", createResponse);
        return; // Retry later
      }
    } else if (checkResponse.status === 200) {
      // Task exists, so update it
      console.log("Task found on backend. Updating:", task);
      const updateResponse = await taskApi.update(task);

      if (updateResponse.status === 200) {
        allTasks[taskIndex] = { ...updateResponse.data, synced: true };
        console.log("Task updated and synced:", allTasks[taskIndex]);
      } else if (updateResponse.status === 409) {
        // Conflict! Server's version is newer.
        allTasks[taskIndex] = { ...updateResponse.data, synced: true };
        console.warn("Conflict for task:", task.id, "Server version restored.");
        chrome.notifications.create({
          type: "basic",
          iconUrl: "logo.png", // Assumes logo.png is in the extension's root
          title: "Sync Conflict",
          message: `Your change to "${updateResponse.data.description}" was overwritten. Your version: "${task.description}"`,
        });
      } else {
        console.error("Failed to update task on backend:", updateResponse);
        return; // Retry later
      }
    } else {
      console.error("Unhandled status when checking task:", checkResponse);
      return; // Retry later
    }
  }

  // Finally, save the updated tasks array back to storage
  await chrome.storage.local.set({ tasks: allTasks });
};
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
      const backendTasks = await taskApi.seedFromBackend();
      if (backendTasks && backendTasks.length > 0) {
        // Mark all fetched tasks as synced before storing them
        const tasksToStore = backendTasks.map((task) => ({
          ...task,
          synced: true,
        }));
        await chrome.storage.local.set({ tasks: tasksToStore });
        console.log(
          `Successfully seeded ${tasksToStore.length} tasks from the backend.`
        );
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
 * Batches all unsynced tasks and sends them in a single request to /api/tasks/sync.
 * The server handles creation, updates, and deletion based on task state.
 */
const syncAllUnsyncedTasks = async () => {
  console.log("Checking for unsynced tasks...");
  const allTasks = (await chrome.storage.local.get({ tasks: [] })).tasks;

  // Separate tasks into active and deleted
  const unsyncedTasks = allTasks.filter((task) => !task.synced);
  const activeTasks = unsyncedTasks.filter((task) => !task.deleted);
  const deletedTasks = unsyncedTasks.filter((task) => task.deleted);

  if (unsyncedTasks.length === 0) {
    console.log("All tasks are up to date.");
    return;
  }

  console.log(
    `Found ${unsyncedTasks.length} unsynced tasks. Syncing in batch...`
  );
  console.log(`  - ${activeTasks.length} to create/update`);
  console.log(`  - ${deletedTasks.length} to delete`);

  try {
    // Prepare payload: send all unsynced tasks to the sync endpoint
    const syncPayload = unsyncedTasks.map((task) => ({
      id: task.id,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt,
      updated_at: task.updated_at,
      deleted: task.deleted || false,
    }));

    // Call the batch sync endpoint
    const syncResponse = await taskApi.sync(syncPayload);

    if (syncResponse.status === 200 && syncResponse.data.success) {
      // Sync succeeded! Mark all synced tasks and handle deletions
      console.log("Batch sync successful:", syncResponse.data);

      const updatedTasks = allTasks
        .map((task) => {
          if (!task.synced) {
            if (task.deleted) {
              // Task was deleted and synced - remove it from storage
              return null; // Mark for removal
            } else {
              // Task was created/updated and synced - mark it as synced
              return { ...task, synced: true };
            }
          }
          return task; // Already synced, no change
        })
        .filter((task) => task !== null); // Remove deleted tasks

      await chrome.storage.local.set({ tasks: updatedTasks });
      console.log("Local storage updated. All synced tasks marked as synced.");
    } else {
      console.error(
        "Batch sync failed or returned unexpected response:",
        syncResponse
      );

      // Handle partial failures if any tasks were rejected
      if (
        syncResponse.data &&
        syncResponse.data.failed &&
        syncResponse.data.failed.length > 0
      ) {
        console.warn("Some tasks failed to sync:", syncResponse.data.failed);
        syncResponse.data.failed.forEach((failedTask) => {
          console.warn(
            `Task ${failedTask.task.id} failed: ${failedTask.reason}`
          );
        });
      }
    }
  } catch (error) {
    console.error("Network error during batch sync:", error.message);
    // Don't mark tasks as synced on failure - they'll retry next time
  }

  console.log("Finished sync cycle.");
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
// Batch syncing is handled by syncAllUnsyncedTasks() which sends all unsynced tasks
// to the backend in a single request to /api/tasks/sync

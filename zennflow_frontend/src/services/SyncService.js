import tasksService from "./tasks.js";
import sessionService from "./sessions.js";

const STORAGE_KEY = "zennflow_offline_queue";

export const SyncService = {
  /**
   * 1. HANDLING FAILED SYNCS
   * Instead of calling the API directly, we add actions to a persistent queue.
   * If the network is down, the data stays here until we are back online.
   */
  enqueue: async (actionType, payload) => {
    // CHROME EXTENSION: Use chrome.storage.local instead of localStorage
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const queue = result[STORAGE_KEY] || [];

    queue.push({ actionType, payload, retryCount: 0 });

    await chrome.storage.local.set({ [STORAGE_KEY]: queue });

    // Notify background script to process the queue immediately
    chrome.runtime.sendMessage({ type: "SYNC_NOW" }).catch(() => {});
  },

  processQueue: async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const queue = result[STORAGE_KEY] || [];

    if (queue.length === 0) return;

    const remainingQueue = [];

    for (const item of queue) {
      try {
        await SyncService.sendToApi(item);
      } catch (error) {
        console.error("Sync failed for item:", item, error);

        // CHROME EXTENSION: Handle Axios errors
        // If 4xx (Client Error), discard it to prevent infinite loops
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          console.warn("Client error (4xx), discarding item:", item);
          // Do not push to remainingQueue
        } else {
          // If Network Error or 5xx (Server Error), keep in queue for retry
          item.retryCount += 1;
          remainingQueue.push(item);
        }
      }
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: remainingQueue });
  },

  sendToApi: async (item) => {
    const { actionType, payload } = item;

    // Map queue actions to actual service calls
    switch (actionType) {
      case "CREATE_TASK":
        await tasksService.create(payload);
        break;
      case "UPDATE_TASK":
        await tasksService.update(payload);
        break;
      case "DELETE_TASK":
        await tasksService.remove(payload);
        break;
      case "CREATE_SESSION":
        await sessionService.create(payload);
        break;
      case "UPDATE_SESSION":
        await sessionService.update(payload.id, payload);
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
    // 3. RESOLVING CONFLICTS
    // If the server returns 409 Conflict, we handle it here.
    // Example: Server says "Version 2 exists", but we sent "Version 1"
    /*
    if (response.status === 409) {
      const serverData = await response.json();
      // Strategy: Last Write Wins (LWW) or Manual Merge
      if (new Date(item.payload.updatedAt) > new Date(serverData.updatedAt)) {
        // Force update (Client Wins)
        await fetch('/api/sync?force=true', ...);
      } else {
        // Discard local change (Server Wins) and notify user
        console.warn("Conflict detected: Server version is newer. Local change discarded.");
        return; 
      }
    }
    */
  },

  // Helper to check queue size
  getPendingCount: async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] || []).length;
  },
};

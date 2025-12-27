/**
 * Creates an asynchronous persister for React Query that uses chrome.storage.local.
 * This is necessary because chrome.storage is async, while the default
 * persisters often expect a synchronous storage API (like localStorage).
 */
export const createChromeStoragePersister = () => {
  return {
    persistClient: async (client) => {
      const value = await chrome.storage.local.get(["zennflow_tasks_cache"]);
      client.setClientState(value["zennflow_tasks_cache"]);
    },
    restoreClient: async () => {
      const result = await chrome.storage.local.get(["zennflow_tasks_cache"]);
      return result["zennflow_tasks_cache"];
    },
    removeClient: async () => {
      await chrome.storage.local.remove(["zennflow_tasks_cache"]);
    },
  };
};

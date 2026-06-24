import axios from "axios";
const baseUrl = "http://localhost:3001/api/tasks";

// CHROME EXTENSION: Use fetch adapter for Service Worker compatibility
const api = axios.create({
  baseURL: baseUrl,
  adapter: "fetch",
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  // Get the token from chrome.storage.local if it exists
  try {
    const result = await chrome.storage.local.get("token");
    if (result && result.token) {
      config.headers.Authorization = `Bearer ${result.token}`;
    }
  } catch (error) {
    console.error("Failed to retrieve token from chrome.storage.local:", error);
  }
  return config;
});

/**
 * Syncs a batch of tasks to the backend using the offline-first sync endpoint.
 * This is the ONLY way tasks are communicated to the server.
 *
 * @param {Array} tasksToSync - Array of tasks with id, description, completed, createdAt, updated_at
 * @returns {Promise} Response from /api/tasks/sync
 */
const sync = async (tasksToSync) => {
  try {
    const response = await api.post("/sync", tasksToSync);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

/**
 * Seeds initial data from backend (for fresh installs).
 * Attempts to fetch all tasks if local storage is empty.
 */
const seedFromBackend = async () => {
  try {
    const response = await api.get("");
    return response.data;
  } catch (error) {
    console.error("Failed to seed data from backend:", error.message);
    return [];
  }
};

export default { sync, seedFromBackend };

import axios from "axios";
const baseUrl = "http://localhost:3001/api/sessions";

const api = axios.create({
  baseURL: baseUrl,
  adapter: "fetch",
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  try {
    const result = await chrome.storage.local.get("token");
    if (result && result.token) {
      config.headers.Authorization = `Bearer ${result.token}`;
    }
  } catch (error) {
    console.error("Failed to retrieve token for sessions API:", error);
  }
  return config;
});

/**
 * Get all focus sessions for the user
 * @returns {Promise<Array>} List of focus sessions
 */
const getAllSessions = async () => {
  const response = await api.get("/");
  return response.data;
};

/**
 * Start a new focus session
 * @param {object} sessionData - { duration, taskId } (duration in ms)
 * @returns {Promise<object>} Created session
 */
const startSession = async (sessionData) => {
  const response = await api.post("/", sessionData);
  return response.data;
};

/**
 * Update an ongoing focus session (e.g. mark complete or save accrued focus time)
 * @param {string} sessionId - Session MongoDB ID
 * @param {object} updateData - { focusedTime, completed } (focusedTime in ms)
 * @returns {Promise<object>} Updated session
 */
const updateSession = async (sessionId, updateData) => {
  const response = await api.put(`/${sessionId}`, updateData);
  return response.data;
};

/**
 * Delete a focus session
 * @param {string} sessionId - Session MongoDB ID
 * @returns {Promise<void>}
 */
const deleteSession = async (sessionId) => {
  await api.delete(`/${sessionId}`);
};

export default {
  getAllSessions,
  startSession,
  updateSession,
  deleteSession,
};

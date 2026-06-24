import axios from "axios";
const baseUrl = "http://localhost:3001/api/users";

const api = axios.create({
  baseURL: baseUrl,
  adapter: "fetch",
});

/**
 * Register a new user
 * @param {object} userData - { username, email, password, name }
 * @returns {Promise<object>} User data
 */
const register = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

/**
 * Login user
 * @param {object} credentials - { username, password }
 * @returns {Promise<object>} Auth response with token, username, name
 */
const login = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data;
};

export default { register, login };

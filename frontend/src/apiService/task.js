import axios from "axios";
const baseUrl = "http://localhost:3000/tasks";

// CHROME EXTENSION: Use fetch adapter for Service Worker compatibility
const api = axios.create({
  baseURL: baseUrl,
  adapter: "fetch",
});

const getAll = async () => {
  const response = await api.get("");
  return response.data;
};

const create = async (newTaskObject) => {
  const response = await api.post("", newTaskObject);
  return response;
};

const remove = async (object) => {
  const response = await api.delete(`/${object.id}`);
  return response;
};

const update = async (object) => {
  try {
    const response = await api.put(`/${object.id}`, object);
    return response;
  } catch (error) {
    // If the server responds with an error (e.g., 409 Conflict),
    // axios throws an exception. We catch it and return the error response
    // so the background script can handle it.
    if (error.response) {
      return error.response;
    }
    // Re-throw if it's a network error or something else
    throw error;
  }
};

const getById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export default { getAll, create, remove, update, getById };

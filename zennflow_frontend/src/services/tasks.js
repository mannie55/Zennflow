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
  return response.data;
};

const remove = async (object) => {
  const response = await api.delete(`/${object.id}`);

  return response.data;
};

const update = async (object) => {
  const response = await api.put(`/${object.id}`, object);
  return response.data;
};

export default { getAll, create, remove, update };

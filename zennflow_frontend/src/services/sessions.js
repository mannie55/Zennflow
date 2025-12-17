import axios from "axios";
const baseUrl = "http://localhost:3000/sessions";

// CHROME EXTENSION: Use fetch adapter for Service Worker compatibility
const api = axios.create({
  baseURL: baseUrl,
  adapter: "fetch",
});

const create = async (payload) => {
  const response = await api.post("", payload);
  return response.data;
};

const update = async (id, payload) => {
  const response = await api.put(`/${id}`, payload);
  return response.data;
};

const getAll = async () => {
  const response = await api.get("");
  return response.data;
};

export default { create, update, getAll };

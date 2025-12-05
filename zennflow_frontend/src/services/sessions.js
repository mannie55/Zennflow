import axios from "axios";
const baseUrl = "http://localhost:3000/sessions";

const create = async (payload) => {
  const response = await axios.post(baseUrl, payload);
  return response.data;
};

const update = async (id, payload) => {
  const response = await axios.put(`${baseUrl}/${id}`, payload);
  return response.data;
};

const getAll = async () => {
  const response = await axios.get(baseUrl);
};

export default { create, update, getAll };

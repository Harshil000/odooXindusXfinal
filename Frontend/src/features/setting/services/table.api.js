import axios from "axios";

const api = axios.create({
  baseURL: "/api/tables",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { message: error.message };
  return { message: String(error) };
};

export async function getTables() {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createTable(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteTable(id) {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function releaseTable(id) {
  try {
    const response = await api.patch(`/${id}/release`);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

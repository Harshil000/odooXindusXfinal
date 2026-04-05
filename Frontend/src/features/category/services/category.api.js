import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/categories",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { error: error.message };
  return { error: String(error) };
};

export async function getCategories() {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createCategory(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteCategory(id) {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateCategory(id, data) {
  try {
    const response = await api.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

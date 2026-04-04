import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/products",
  withCredentials: true,
});

const categoryApi = axios.create({
  baseURL: "http://localhost:3000/api/categories",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { error: error.message };
  return { error: String(error) };
};

export async function getProducts() {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createProduct(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateProduct(id, data) {
  try {
    const response = await api.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteProduct(id) {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getCategories() {
  try {
    const response = await categoryApi.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createCategory(data) {
  try {
    const response = await categoryApi.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

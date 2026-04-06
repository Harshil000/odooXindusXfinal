import axios from "axios";

const api = axios.create({
  baseURL: "/api/customers",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { error: error.message };
  return { error: String(error) };
};

export async function getCustomers() {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createCustomer(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateCustomer(id, data) {
  try {
    const response = await api.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteCustomer(id) {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

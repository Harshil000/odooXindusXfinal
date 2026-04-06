import axios from "axios";

const api = axios.create({
  baseURL: "/api/order-items",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { error: error.message };
  return { error: String(error) };
};

export async function createOrderItem(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}
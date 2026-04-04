import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/orders",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { error: error.message };
  return { error: String(error) };
};

export async function getOrders() {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getOrderDetails(orderId) {
  try {
    const response = await api.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

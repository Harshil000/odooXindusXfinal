import axios from "axios";

const api = axios.create({
  baseURL: "/api/orders",
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

export async function createOrder(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await api.put(`/${orderId}`, { status });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function sendOrderReceipt(data) {
  try {
    const response = await api.post("/sendReceipt", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function sendCombinedOrderReceipt(data) {
  try {
    const response = await api.post("/sendCombinedReceipt", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

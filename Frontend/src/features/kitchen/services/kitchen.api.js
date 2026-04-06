import axios from "axios";

const api = axios.create({
  baseURL: "/api/kitchen",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { message: error.message };
  return { message: String(error) };
};

export async function getKitchenOrders() {
  try {
    const response = await api.get("/orders", {
      params: { status: "to_cook,preparing,completed,pending" },
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateKitchenOrderStatus(orderId, status) {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/payments",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { error: error.message };
  return { error: String(error) };
};

export async function createRazorpayOrder(data) {
  try {
    const response = await api.post("/order", data);
    return response.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createCashPayment(data) {
  try {
    const response = await api.post("/cash", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getPaymentHistory() {
  try {
    const response = await api.get("/history");
    return response.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function verifyRazorpayPayment(data) {
  try {
    const response = await api.post("/verify", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

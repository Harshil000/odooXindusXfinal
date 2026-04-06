import axios from "axios";

const api = axios.create({
  baseURL: "/api/dashboard",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "Unable to load dashboard data";
};

export async function getDashboardOverview(params) {
  try {
    const response = await api.get("/overview", { params });
    return response.data;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

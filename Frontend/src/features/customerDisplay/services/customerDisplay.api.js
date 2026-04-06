import axios from "axios";

const tableApi = axios.create({
  baseURL: "/api/tables",
  withCredentials: true,
});

const displayApi = axios.create({
  baseURL: "/api/customer-display",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { message: error.message };
  return { message: String(error) };
};

export async function getTables() {
  try {
    const response = await tableApi.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function generateTrackToken(payload) {
  try {
    const response = await displayApi.post("/token", payload);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

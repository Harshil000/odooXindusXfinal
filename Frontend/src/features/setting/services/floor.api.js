import axios from "axios";

const api = axios.create({
  baseURL: "/api/floors",
  withCredentials: true,
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { message: error.message };
  return { message: String(error) };
};

export async function getFloors() {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createFloor(data) {
  try {
    const response = await api.post("/", data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteFloor(id) {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    throw normalizeError(error);
  }
}

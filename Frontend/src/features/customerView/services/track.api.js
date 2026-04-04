import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/public",
});

const normalizeError = (error) => {
  if (error?.response?.data) return error.response.data;
  if (error?.message) return { message: error.message };
  return { message: String(error) };
};

export async function getTrackData(token) {
  try {
    const response = await api.get(`/track/${token}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

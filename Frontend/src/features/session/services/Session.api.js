import axios from "axios";

const api = axios.create({
    baseURL : "/api/sessions",
    withCredentials: true,
})

export async function getAllSessions() {
    try {
        const response = await api.get("/");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unable to load session" };
    }
}

export async function getActiveSession() {
    try {
        const response = await api.get("/active");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unable to load active session" };
    }
}

export async function createSession() {
    try {
        const response = await api.post("/");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unable to create session" };
    }
}

export async function closeSession(sessionId) {
    try {
        const response = await api.put(`/${sessionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Unable to close session" };
    }
}
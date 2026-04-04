import axios from "axios";

const api = axios.create({
    baseURL : "http://localhost:3000/api/auth"
})

export async function register(data){
    try {
        const response = await api.post("/register", data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response.data;
    }
}

export async function login(data){
    try {
        const response = await api.post("/login", data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response.data;
    }
}
import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api"; // Change if deployed

// Create an Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token for authenticated requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Store token in localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        'Content-Type': 'application/json',
    },
});
// Thiết lập Interceptor (Người trung chuyển)
API.interceptors.request.use((config) => {
    let token = localStorage.getItem("token");
    if (token) {
        // Xóa dấu ngoặc kép thừa (nếu có)
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }
        // Chỉ ghi đè nếu chưa có hoặc có thể ghi đè
        if (!config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export default API;
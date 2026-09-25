import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
class ApiClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Request interceptor to add auth token
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data.data;
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data.data;
    }
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data.data;
    }
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data.data;
    }
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data.data;
    }
    async getPaginated(url, page = 1, pageSize = 10, config) {
        const response = await this.client.get(url, {
            ...config,
            params: { page, pageSize, ...config?.params },
        });
        return response.data;
    }
}
export const apiClient = new ApiClient();

import { apiClient } from './api';
export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', {
            email,
            password,
        });
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    getToken: () => {
        return localStorage.getItem('authToken');
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },
};

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../storage/secureStore';

const API_URL: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - automatically attach JWT token
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await secureStorage.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle common errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        // Handle 401 Unauthorized - clear token
        if (error.response?.status === 401) {
            try {
                await secureStorage.deleteToken();
            } catch (e) {
                console.error('Error clearing token:', e);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

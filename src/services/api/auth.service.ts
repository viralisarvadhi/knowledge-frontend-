import axiosInstance from './axiosInstance';
import { User } from '../../types';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'trainee' | 'admin';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

export const authService = {
    /**
     * Register a new user
     */
    async register(userData: RegisterData): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);
        return response.data;
    },

    /**
     * Login user
     */
    async login(credentials: LoginData): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    /**
     * Get current user profile
     */
    async getMe(): Promise<User> {
        const response = await axiosInstance.get<User>('/auth/me');
        return response.data;
    },
};

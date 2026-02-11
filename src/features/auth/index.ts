import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, LoginData, RegisterData, AuthResponse } from '../../services/api/auth.service';
import { secureStorage } from '../../services/storage/secureStore';
import { socketClient } from '../../services/socket/socketClient';
import { User } from '../../types';

interface AuthState {
    user: User | null;
    token: string | null;
    role: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    role: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginData, { rejectWithValue }) => {
        try {
            const data = await authService.login(credentials);
            if (data.token) {
                await secureStorage.setToken(data.token);
                socketClient.connect(data.token);
            }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: RegisterData, { rejectWithValue }) => {
        try {
            const data = await authService.register(userData);
            if (data.token) {
                await secureStorage.setToken(data.token);
                socketClient.connect(data.token);
            }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
        }
    }
);

export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.getMe();
            return { user };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get user');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            state.error = null;
            secureStorage.deleteToken();
            socketClient.disconnect();
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.role = action.payload.user?.role;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.role = action.payload.user?.role;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(register.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Get Me
            .addCase(getMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMe.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.role = action.payload.user?.role;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminService } from '../../services/api/admin.service';
import { User, AdminState, TicketStats, UserStats, Solution } from '../../types';

const initialState: AdminState = {
    usersList: [],
    pendingSolutions: [],
    userStats: null,
    ticketStats: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'admin/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const data = await adminService.getUsers();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const fetchUserStats = createAsyncThunk(
    'admin/fetchUserStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await adminService.getUserStats();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stats');
        }
    }
);

export const fetchTicketStats = createAsyncThunk(
    'admin/fetchTicketStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await adminService.getTicketStats();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket stats');
        }
    }
);

export const fetchPendingSolutions = createAsyncThunk(
    'admin/fetchPendingSolutions',
    async (_, { rejectWithValue }) => {
        try {
            const data = await adminService.getPendingSolutions();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending solutions');
        }
    }
);

export const approveSolution = createAsyncThunk(
    'admin/approveSolution',
    async (solutionId: string, { rejectWithValue }) => {
        try {
            const data = await adminService.approveSolution(solutionId);
            return { solutionId, ...data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve solution');
        }
    }
);

export const rejectSolution = createAsyncThunk(
    'admin/rejectSolution',
    async (solutionId: string, { rejectWithValue }) => {
        try {
            const data = await adminService.rejectSolution(solutionId);
            return { solutionId, ...data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject solution');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            await adminService.deleteUser(userId);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

export const disableSolution = createAsyncThunk(
    'admin/disableSolution',
    async (solutionId: string, { rejectWithValue }) => {
        try {
            const data = await adminService.disableSolution(solutionId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to disable solution');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetStats: (state) => {
            state.userStats = null;
            state.ticketStats = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.usersList = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch user stats
            .addCase(fetchUserStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<UserStats>) => {
                state.loading = false;
                state.userStats = action.payload;
            })
            .addCase(fetchUserStats.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch ticket stats
            .addCase(fetchTicketStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTicketStats.fulfilled, (state, action: PayloadAction<TicketStats>) => {
                state.loading = false;
                state.ticketStats = action.payload;
            })
            .addCase(fetchTicketStats.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Pending solutions
            .addCase(fetchPendingSolutions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPendingSolutions.fulfilled, (state, action: PayloadAction<Solution[]>) => {
                state.loading = false;
                state.pendingSolutions = action.payload;
            })
            .addCase(fetchPendingSolutions.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Approve/Reject solution
            .addCase(approveSolution.fulfilled, (state, action: PayloadAction<{ solutionId: string }>) => {
                state.pendingSolutions = state.pendingSolutions.filter(s => s.id !== action.payload.solutionId);
            })
            .addCase(rejectSolution.fulfilled, (state, action: PayloadAction<{ solutionId: string }>) => {
                state.pendingSolutions = state.pendingSolutions.filter(s => s.id !== action.payload.solutionId);
            })
            // Disable solution
            .addCase(disableSolution.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(disableSolution.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(disableSolution.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.usersList = state.usersList.filter(user => user.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, resetStats } = adminSlice.actions;
export default adminSlice.reducer;

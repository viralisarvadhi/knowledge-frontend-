import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { solutionService } from '../../services/api/solution.service';
import { Ticket, Solution } from '../../types';

interface SolutionState {
    list: Solution[];
    searchResults: Solution[];
    loading: boolean;
    error: string | null;
}

const initialState: SolutionState = {
    list: [],
    searchResults: [],
    loading: false,
    error: null,
};

// Async thunks
export const searchSolutions = createAsyncThunk<Solution[], string>(
    'solutions/searchSolutions',
    async (query: string, { rejectWithValue }) => {
        try {
            const data = await solutionService.searchSolutions(query);
            return Array.isArray(data) ? data : (data as any).solutions;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

export const getSolutionById = createAsyncThunk(
    'solutions/getSolutionById',
    async (solutionId: string, { rejectWithValue }) => {
        try {
            const data = await solutionService.getSolutionById(solutionId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get solution');
        }
    }
);

const solutionsSlice = createSlice({
    name: 'solutions',
    initialState,
    reducers: {
        // Socket-safe reducers
        addSolution: (state, action: PayloadAction<Solution>) => {
            const exists = state.list.find(s => s.id === action.payload.id);
            if (!exists) {
                state.list.unshift(action.payload);
            }
        },
        updateSolution: (state, action: PayloadAction<Solution>) => {
            const listIndex = state.list.findIndex(s => s.id === action.payload.id);
            if (listIndex !== -1) {
                state.list[listIndex] = { ...state.list[listIndex], ...action.payload };
            }
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Search solutions
            .addCase(searchSolutions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchSolutions.fulfilled, (state, action: PayloadAction<Solution[] | { solutions: Solution[] }>) => {
                state.loading = false;
                state.searchResults = Array.isArray(action.payload) ? action.payload : action.payload.solutions;
            })
            .addCase(searchSolutions.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get solution by ID
            .addCase(getSolutionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSolutionById.fulfilled, (state, action: PayloadAction<{ solution?: Solution } | Solution>) => {
                state.loading = false;
                const payload = action.payload as any;
                const solution = payload.solution || (payload.id ? payload : null);
                if (solution) {
                    const exists = state.list.find(s => s.id === solution.id);
                    if (!exists) {
                        state.list.push(solution);
                    }
                }
            })
            .addCase(getSolutionById.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { addSolution, updateSolution, clearSearchResults, clearError } = solutionsSlice.actions;
export default solutionsSlice.reducer;

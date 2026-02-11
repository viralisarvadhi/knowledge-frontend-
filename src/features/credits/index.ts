import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreditState {
    totalCredits: number;
    loading: boolean;
    error: string | null;
}

const initialState: CreditState = {
    totalCredits: 0,
    loading: false,
    error: null,
};

const creditsSlice = createSlice({
    name: 'credits',
    initialState,
    reducers: {
        setCredits: (state, action: PayloadAction<number>) => {
            state.totalCredits = action.payload;
        },
        addCredits: (state, action: PayloadAction<number>) => {
            state.totalCredits += action.payload;
        },
        subtractCredits: (state, action: PayloadAction<number>) => {
            state.totalCredits = Math.max(0, state.totalCredits - action.payload);
        },
        resetCredits: (state) => {
            state.totalCredits = 0;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setCredits, addCredits, subtractCredits, resetCredits, clearError } = creditsSlice.actions;
export default creditsSlice.reducer;

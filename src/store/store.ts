import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth';
import ticketsReducer from '../features/tickets';
import adminReducer from '../features/admin';
import solutionsReducer from '../features/solutions';
import creditsReducer from '../features/credits';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tickets: ticketsReducer,
        admin: adminReducer,
        solutions: solutionsReducer,
        credits: creditsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

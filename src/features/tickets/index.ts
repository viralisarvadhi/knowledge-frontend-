import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ticketService, CreateTicketData, ResolveTicketData, ResolveResponse } from '../../services/api/ticket.service';
import { Ticket } from '../../types';

interface TicketState {
    list: Ticket[];
    loading: boolean;
    error: string | null;
}

const initialState: TicketState = {
    list: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchTickets = createAsyncThunk(
    'tickets/fetchTickets',
    async (_, { rejectWithValue }) => {
        try {
            const data = await ticketService.getTickets();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
        }
    }
);

export const createTicket = createAsyncThunk(
    'tickets/createTicket',
    async (ticketData: CreateTicketData, { rejectWithValue }) => {
        try {
            const data = await ticketService.createTicket(ticketData);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create ticket');
        }
    }
);

export const redeemTicket = createAsyncThunk(
    'tickets/redeemTicket',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const data = await ticketService.redeemTicket(ticketId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to redeem ticket');
        }
    }
);

export const resolveTicket = createAsyncThunk(
    'tickets/resolveTicket',
    async ({ ticketId, solutionData }: { ticketId: string, solutionData: ResolveTicketData }, { rejectWithValue }) => {
        try {
            const data = await ticketService.resolveTicket(ticketId, solutionData);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resolve ticket');
        }
    }
);

export const deleteTicket = createAsyncThunk(
    'tickets/deleteTicket',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const data = await ticketService.deleteTicket(ticketId);
            // data should differ based on backend now returning { message, ticket }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete ticket');
        }
    }
);

const ticketsSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        // Socket-safe reducers - called by socketClient
        addTicket: (state, action: PayloadAction<Ticket>) => {
            const exists = state.list.some(t => String(t.id) === String(action.payload.id));
            if (!exists) {
                state.list.unshift(action.payload);
            }
        },
        updateTicket: (state, action: PayloadAction<Ticket>) => {
            const index = state.list.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = { ...state.list[index], ...action.payload };
            }
        },
        removeTicket: (state, action: PayloadAction<string>) => {
            state.list = state.list.filter(t => t.id !== action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch tickets
            .addCase(fetchTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<Ticket[] | { tickets: Ticket[] }>) => {
                state.loading = false;
                const newTickets = Array.isArray(action.payload) ? action.payload : action.payload.tickets;
                // Deduplicate by ID just in case
                const uniqueTickets = Array.from(new Map(newTickets.map(item => [item.id, item])).values());
                state.list = uniqueTickets;
            })
            .addCase(fetchTickets.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Resolve ticket
            .addCase(resolveTicket.fulfilled, (state, action) => {
                state.loading = false;
                // Socket handles updating, but we can proactively update locally if needed
            })
            // Delete ticket
            .addCase(deleteTicket.fulfilled, (state, action: PayloadAction<{ ticket: Ticket }>) => {
                state.loading = false;
                // Update the ticket in the list with the deleted status/timestamp
                const index = state.list.findIndex(t => t.id === action.payload.ticket.id);
                if (index !== -1) {
                    state.list[index] = action.payload.ticket;
                }
            });
    },
});

export const { addTicket, updateTicket, removeTicket, clearError } = ticketsSlice.actions;
export default ticketsSlice.reducer;

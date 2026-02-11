import { io, Socket } from 'socket.io-client';
import { Store } from '@reduxjs/toolkit';

let socket: Socket | null = null;
let appStore: Store | null = null;

const SOCKET_URL: string = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const socketClient = {
    /**
     * Set the Redux store
     */
    setStore(store: Store) {
        appStore = store;
    },

    /**
     * Connect to Socket.io server
     */
    connect(token: string) {
        if (socket?.connected) {
            console.log('Socket already connected');
            return socket;
        }

        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            forceNew: true,
        });

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket?.id);
        });

        socket.on('disconnect', (reason: string) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', error.message);
        });

        // Listen to backend events and dispatch to Redux
        this.setupEventListeners();

        return socket;
    },

    /**
     * Setup event listeners for backend events
     */
    setupEventListeners() {
        if (!socket) return;

        const dispatch = (action: any) => {
            if (appStore) {
                appStore.dispatch(action);
            } else {
                console.warn('Redux store not set in socketClient');
            }
        };

        // Ticket created event
        socket.on('ticket_created', (data: any) => {
            console.log('🆕 Ticket created:', data);
            dispatch({
                type: 'tickets/addTicket',
                payload: data,
            });
        });

        // Ticket deleted event
        socket.on('ticket_deleted', (data: any) => {
            console.log('🗑️ Ticket deleted:', data);
            dispatch({
                type: 'tickets/updateTicket',
                payload: data,
            });
        });

        // Ticket redeemed event
        socket.on('ticket_redeemed', (data: any) => {
            console.log('🔄 Ticket redeemed:', data);
            dispatch({
                type: 'tickets/updateTicket',
                payload: data,
            });
        });

        // Ticket resolved event
        socket.on('ticket_resolved', (data: any) => {
            console.log('✅ Ticket resolved:', data);
            dispatch({
                type: 'tickets/updateTicket',
                payload: data.ticket,
            });
            if (data.solution) {
                dispatch({
                    type: 'solutions/addSolution',
                    payload: data.solution,
                });
            }
        });

        // Ticket reopened event (after rejection)
        socket.on('ticket_reopened', (data: any) => {
            console.log('🔄 Ticket reopened:', data);
            dispatch({
                type: 'tickets/updateTicket',
                payload: data,
            });
        });

        // Solution approved event (credit update)
        socket.on('solution_approved', (data: any) => {
            console.log('💰 Solution approved (Credits updated):', data);
            dispatch({
                type: 'auth/updateUser',
                payload: { totalCredits: data.totalCredits },
            });
            dispatch({
                type: 'solutions/updateSolution',
                payload: { id: data.solutionId, status: 'approved' },
            });
        });
    },

    /**
     * Disconnect from Socket.io server
     */
    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
            console.log('Socket disconnected');
        }
    },

    /**
     * Emit custom event
     */
    emit(event: string, data: any) {
        if (socket?.connected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit event:', event);
        }
    },

    /**
     * Get socket instance
     */
    getSocket(): Socket | null {
        return socket;
    },

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return socket?.connected || false;
    },
};

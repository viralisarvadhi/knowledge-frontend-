import axiosInstance from './axiosInstance';
import { Ticket } from '../../types';

export interface CreateTicketData {
    title: string;
    description: string;
    attachments?: any[];
}

export interface ResolveTicketData {
    rootCause: string;
    fixSteps: string;
    preventionNotes?: string;
    tags?: string[];
    attachments?: any[];
}

export interface ResolveResponse {
    message: string;
    ticket: Ticket;
    solution: any;
    creditsAwarded: number;
}

export const ticketService = {
    /**
     * Get all tickets
     */
    async getTickets(): Promise<Ticket[]> {
        const response = await axiosInstance.get<Ticket[]>('/tickets');
        return response.data;
    },

    /**
     * Create a new ticket
     */
    async createTicket(ticketData: CreateTicketData): Promise<{ message: string; ticket: Ticket }> {
        const formData = new FormData();
        formData.append('title', ticketData.title);
        formData.append('description', ticketData.description);

        if (ticketData.attachments) {
            ticketData.attachments.forEach((file: any) => {
                formData.append('attachments', {
                    uri: file.uri,
                    name: file.fileName || `photo_${Date.now()}.jpg`,
                    type: file.mimeType || 'image/jpeg',
                } as any);
            });
        }

        const response = await axiosInstance.post<{ message: string; ticket: Ticket }>('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Redeem a ticket
     */
    async redeemTicket(ticketId: string): Promise<{ message: string; ticket: Ticket }> {
        const response = await axiosInstance.patch<{ message: string; ticket: Ticket }>(`/tickets/${ticketId}/redeem`);
        return response.data;
    },

    /**
     * Resolve a ticket with solution
     */
    async resolveTicket(ticketId: string, solutionData: ResolveTicketData): Promise<ResolveResponse> {
        const formData = new FormData();
        formData.append('rootCause', solutionData.rootCause);
        formData.append('fixSteps', solutionData.fixSteps);

        if (solutionData.preventionNotes) {
            formData.append('preventionNotes', solutionData.preventionNotes);
        }

        if (solutionData.tags) {
            solutionData.tags.forEach(tag => formData.append('tags[]', tag));
        }

        if (solutionData.attachments) {
            solutionData.attachments.forEach((file: any) => {
                formData.append('attachments', {
                    uri: file.uri,
                    name: file.fileName || `photo_${Date.now()}.jpg`,
                    type: file.mimeType || 'image/jpeg',
                } as any);
            });
        }

        const response = await axiosInstance.patch<ResolveResponse>(`/tickets/${ticketId}/resolve`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Resolve a ticket using an existing solution
     */
    async resolveWithExistingSolution(ticketId: string, solutionId: string): Promise<ResolveResponse> {
        const response = await axiosInstance.patch<ResolveResponse>(`/tickets/${ticketId}/resolve-with-existing`, { solutionId });
        return response.data;
    },

    /**
     * Delete a ticket
     */
    async deleteTicket(ticketId: string): Promise<{ message: string; ticket: Ticket }> {
        const response = await axiosInstance.delete<{ message: string; ticket: Ticket }>(`/tickets/${ticketId}`);
        return response.data;
    },
};

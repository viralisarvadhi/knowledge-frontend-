import axiosInstance from './axiosInstance';
import { User, TicketStats, UserStats, Solution } from '../../types';

export { TicketStats, UserStats };

export const adminService = {
    /**
     * Get user statistics (admin only)
     */
    async getUserStats(): Promise<UserStats> {
        const response = await axiosInstance.get<UserStats>('/admin/users/stats');
        return response.data;
    },

    /**
     * Get all users (admin only)
     */
    async getUsers(): Promise<User[]> {
        const response = await axiosInstance.get<User[]>('/admin/users');
        return response.data;
    },

    /**
     * Get ticket statistics (admin only)
     */
    async getTicketStats(): Promise<TicketStats> {
        const response = await axiosInstance.get<TicketStats>('/admin/tickets/stats');
        return response.data;
    },

    /**
     * Disable a solution (admin only)
     */
    async disableSolution(solutionId: string): Promise<any> {
        const response = await axiosInstance.patch(`/admin/solutions/${solutionId}/disable`);
        return response.data;
    },

    /**
     * Get pending solutions for review
     */
    async getPendingSolutions(): Promise<Solution[]> {
        const response = await axiosInstance.get<Solution[]>('/admin/solutions/pending');
        return response.data;
    },

    /**
     * Approve a solution
     */
    async approveSolution(solutionId: string): Promise<any> {
        const response = await axiosInstance.patch(`/admin/solutions/${solutionId}/approve`);
        return response.data;
    },

    /**
     * Reject a solution
     */
    async rejectSolution(solutionId: string): Promise<any> {
        const response = await axiosInstance.patch(`/admin/solutions/${solutionId}/reject`);
        return response.data;
    },

    /**
     * Delete a user (admin only)
     */
    async deleteUser(userId: string): Promise<any> {
        const response = await axiosInstance.delete(`/admin/users/${userId}`);
        return response.data;
    },
};

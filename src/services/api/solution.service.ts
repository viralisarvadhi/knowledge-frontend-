import axiosInstance from './axiosInstance';
import { Ticket, Solution } from '../../types';

export interface SearchResult {
    tickets: Ticket[];
}

export const solutionService = {
    /**
     * Search solutions by query
     */
    async searchSolutions(query: string): Promise<Ticket[]> {
        const response = await axiosInstance.get<Ticket[]>('/solutions/search', {
            params: { q: query },
        });
        return response.data;
    },

    /**
     * Get solution by ID
     */
    async getSolutionById(solutionId: string): Promise<Solution> {
        const response = await axiosInstance.get<Solution>(`/solutions/${solutionId}`);
        return response.data;
    },
};

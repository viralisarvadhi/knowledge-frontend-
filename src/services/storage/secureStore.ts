import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';

export const secureStorage = {
    /**
     * Store authentication token
     * @param {string} token - JWT token
     */
    async setToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    },

    /**
     * Retrieve authentication token
     * @returns {Promise<string|null>} JWT token or null
     */
    async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    },

    /**
     * Delete authentication token
     */
    async deleteToken(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error deleting token:', error);
        }
    },
};

// Secure storage management for ReactNativeTest authentication
// Following enterprise security patterns

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthToken } from './types';

// Storage keys
const STORAGE_KEYS = {
    AUTH_TOKEN: '@ReactNativeTest:authToken',
    USER_EMAIL: '@ReactNativeTest:userEmail',
    REFRESH_TOKEN: '@ReactNativeTest:refreshToken',
} as const;

export class AuthStorage {
    // Store authentication credentials securely
    static async storeCredentials(token: AuthToken, email: string): Promise<void> {
        try {
            const promises = [
                AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token)),
                AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email),
            ];

            if (token.refreshToken) {
                promises.push(
                    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken)
                );
            }

            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to store authentication credentials:', error);
            throw new Error('Failed to save authentication data');
        }
    }

    // Retrieve stored authentication credentials
    static async getCredentials(): Promise<{
        token: AuthToken | null;
        email: string | null;
    }> {
        try {
            const [tokenString, email, refreshToken] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
                AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL),
                AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
            ]);

            if (!tokenString) {
                return { token: null, email: null };
            }

            const token: AuthToken = JSON.parse(tokenString);

            // Add refresh token if available
            if (refreshToken) {
                token.refreshToken = refreshToken;
            }

            return { token, email };
        } catch (error) {
            console.error('Failed to retrieve authentication credentials:', error);
            return { token: null, email: null };
        }
    }

    // Clear all stored authentication data
    static async clearCredentials(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL),
                AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
            ]);
        } catch (error) {
            console.error('Failed to clear authentication credentials:', error);
            throw new Error('Failed to clear authentication data');
        }
    }

    // Check if user has stored credentials
    static async hasStoredCredentials(): Promise<boolean> {
        try {
            const tokenString = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            return !!tokenString;
        } catch (error) {
            console.error('Failed to check stored credentials:', error);
            return false;
        }
    }

    // Update only the auth token (for token refresh scenarios)
    static async updateToken(token: AuthToken): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token));

            if (token.refreshToken) {
                await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken);
            }
        } catch (error) {
            console.error('Failed to update authentication token:', error);
            throw new Error('Failed to update authentication token');
        }
    }

    // Get only the stored email (useful for pre-filling login form)
    static async getStoredEmail(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
        } catch (error) {
            console.error('Failed to retrieve stored email:', error);
            return null;
        }
    }
}

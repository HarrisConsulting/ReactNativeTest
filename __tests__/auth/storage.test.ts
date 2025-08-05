// Authentication storage test suite
// Testing secure AsyncStorage wrapper functionality

import { AuthStorage } from '../../src/auth/storage';
import type { AuthToken } from '../../src/auth/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

describe('AuthStorage', () => {
    const mockAsyncStorage = require('@react-native-async-storage/async-storage');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('storeCredentials', () => {
        test('stores credentials successfully', async () => {
            const token: AuthToken = {
                token: 'test-token-123',
                expiresAt: new Date('2025-12-31T23:59:59Z'),
                refreshToken: 'refresh-token-456'
            };
            const email = 'test@example.com';

            mockAsyncStorage.setItem.mockResolvedValue(undefined);

            await AuthStorage.storeCredentials(token, email);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:authToken',
                JSON.stringify(token)
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:userEmail',
                email
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:refreshToken',
                token.refreshToken
            );
        });

        test('stores credentials without refresh token', async () => {
            const token: AuthToken = {
                token: 'test-token-123',
                expiresAt: new Date('2025-12-31T23:59:59Z')
            };
            const email = 'test@example.com';

            mockAsyncStorage.setItem.mockResolvedValue(undefined);

            await AuthStorage.storeCredentials(token, email);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:authToken',
                JSON.stringify(token)
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:userEmail',
                email
            );
            // Should not call setItem for refresh token when not provided
            expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
        });

        test('handles storage errors gracefully', async () => {
            const token: AuthToken = {
                token: 'test-token-123',
                expiresAt: new Date()
            };
            const email = 'test@example.com';

            mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

            await expect(AuthStorage.storeCredentials(token, email)).rejects.toThrow('Failed to save authentication data');
        });
    });

    describe('getCredentials', () => {
        test('retrieves stored credentials successfully', async () => {
            const token: AuthToken = {
                token: 'test-token-123',
                expiresAt: new Date('2025-12-31T23:59:59Z'),
                refreshToken: 'refresh-token-456'
            };
            const email = 'test@example.com';

            mockAsyncStorage.getItem
                .mockResolvedValueOnce(JSON.stringify(token)) // AUTH_TOKEN
                .mockResolvedValueOnce(email) // USER_EMAIL
                .mockResolvedValueOnce(token.refreshToken); // REFRESH_TOKEN

            const result = await AuthStorage.getCredentials();

            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@ReactNativeTest:authToken');
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@ReactNativeTest:userEmail');
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@ReactNativeTest:refreshToken');

            expect(result.token).toEqual({
                ...token,
                refreshToken: token.refreshToken
            });
            expect(result.email).toBe(email);
        });

        test('returns null when no credentials stored', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const result = await AuthStorage.getCredentials();

            expect(result.token).toBeNull();
            expect(result.email).toBeNull();
        });

        test('handles storage errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const result = await AuthStorage.getCredentials();

            expect(result.token).toBeNull();
            expect(result.email).toBeNull();
        });

        test('handles invalid JSON gracefully', async () => {
            mockAsyncStorage.getItem
                .mockResolvedValueOnce('invalid-json') // AUTH_TOKEN
                .mockResolvedValueOnce('test@example.com') // USER_EMAIL
                .mockResolvedValueOnce(null); // REFRESH_TOKEN

            const result = await AuthStorage.getCredentials();

            expect(result.token).toBeNull();
            expect(result.email).toBeNull();
        });

        test('handles credentials without refresh token', async () => {
            const token: AuthToken = {
                token: 'test-token-123',
                expiresAt: new Date('2025-12-31T23:59:59Z')
            };
            const email = 'test@example.com';

            mockAsyncStorage.getItem
                .mockResolvedValueOnce(JSON.stringify(token)) // AUTH_TOKEN
                .mockResolvedValueOnce(email) // USER_EMAIL
                .mockResolvedValueOnce(null); // REFRESH_TOKEN

            const result = await AuthStorage.getCredentials();

            expect(result.token).toEqual(token);
            expect(result.email).toBe(email);
        });
    });

    describe('clearCredentials', () => {
        test('clears stored credentials successfully', async () => {
            mockAsyncStorage.removeItem.mockResolvedValue(undefined);

            await AuthStorage.clearCredentials();

            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@ReactNativeTest:authToken');
            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@ReactNativeTest:userEmail');
            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@ReactNativeTest:refreshToken');
        });

        test('handles clear errors', async () => {
            mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

            await expect(AuthStorage.clearCredentials()).rejects.toThrow('Failed to clear authentication data');
        });
    });

    describe('hasStoredCredentials', () => {
        test('returns true when credentials exist', async () => {
            mockAsyncStorage.getItem.mockResolvedValue('some-token');

            const result = await AuthStorage.hasStoredCredentials();

            expect(result).toBe(true);
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@ReactNativeTest:authToken');
        });

        test('returns false when no credentials exist', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const result = await AuthStorage.hasStoredCredentials();

            expect(result).toBe(false);
        });

        test('handles errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const result = await AuthStorage.hasStoredCredentials();

            expect(result).toBe(false);
        });
    });

    describe('updateToken', () => {
        test('updates token successfully', async () => {
            const token: AuthToken = {
                token: 'new-token-123',
                expiresAt: new Date('2025-12-31T23:59:59Z'),
                refreshToken: 'new-refresh-token'
            };

            mockAsyncStorage.setItem.mockResolvedValue(undefined);

            await AuthStorage.updateToken(token);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:authToken',
                JSON.stringify(token)
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:refreshToken',
                token.refreshToken
            );
        });

        test('updates token without refresh token', async () => {
            const token: AuthToken = {
                token: 'new-token-123',
                expiresAt: new Date('2025-12-31T23:59:59Z')
            };

            mockAsyncStorage.setItem.mockResolvedValue(undefined);

            await AuthStorage.updateToken(token);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:authToken',
                JSON.stringify(token)
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
        });

        test('handles update errors', async () => {
            const token: AuthToken = {
                token: 'new-token-123',
                expiresAt: new Date()
            };

            mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

            await expect(AuthStorage.updateToken(token)).rejects.toThrow('Failed to update authentication token');
        });
    });

    describe('getStoredEmail', () => {
        test('retrieves stored email successfully', async () => {
            const email = 'test@example.com';
            mockAsyncStorage.getItem.mockResolvedValue(email);

            const result = await AuthStorage.getStoredEmail();

            expect(result).toBe(email);
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@ReactNativeTest:userEmail');
        });

        test('returns null when no email stored', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const result = await AuthStorage.getStoredEmail();

            expect(result).toBeNull();
        });

        test('handles errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const result = await AuthStorage.getStoredEmail();

            expect(result).toBeNull();
        });
    });

    describe('data integrity', () => {
        test('preserves all token properties through store/retrieve cycle', async () => {
            const originalToken: AuthToken = {
                token: 'complex-token-with-special-chars!@#$%^&*()',
                expiresAt: new Date('2025-06-15T14:30:00.000Z'),
                refreshToken: 'refresh-token-with-uuid-12345678-1234-1234-1234-123456789012'
            };
            const email = 'complex.email+test@example-domain.co.uk';

            // Mock successful storage
            mockAsyncStorage.setItem.mockResolvedValue(undefined);

            // Store credentials
            await AuthStorage.storeCredentials(originalToken, email);

            // Mock retrieval
            mockAsyncStorage.getItem
                .mockResolvedValueOnce(JSON.stringify(originalToken))
                .mockResolvedValueOnce(email)
                .mockResolvedValueOnce(originalToken.refreshToken);

            // Retrieve credentials
            const result = await AuthStorage.getCredentials();

            expect(result.token).toEqual({
                ...originalToken,
                refreshToken: originalToken.refreshToken
            });
            expect(result.email).toBe(email);
        });

        test('handles unicode characters in email', async () => {
            const token: AuthToken = {
                token: 'test-token',
                expiresAt: new Date()
            };
            const unicodeEmail = 'test.用户@example.com';

            mockAsyncStorage.setItem.mockResolvedValue(undefined);

            await AuthStorage.storeCredentials(token, unicodeEmail);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@ReactNativeTest:userEmail',
                unicodeEmail
            );
        });
    });

    describe('storage key consistency', () => {
        test('uses consistent storage keys across operations', async () => {
            const token: AuthToken = {
                token: 'test-token',
                expiresAt: new Date()
            };
            const email = 'test@example.com';

            mockAsyncStorage.setItem.mockResolvedValue(undefined);
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.removeItem.mockResolvedValue(undefined);

            // Store operation
            await AuthStorage.storeCredentials(token, email);

            // Get operation
            await AuthStorage.getCredentials();

            // Clear operation
            await AuthStorage.clearCredentials();

            // Check stored email
            await AuthStorage.getStoredEmail();

            // Check has credentials
            await AuthStorage.hasStoredCredentials();

            // Verify consistent key usage
            const expectedKeys = [
                '@ReactNativeTest:authToken',
                '@ReactNativeTest:userEmail',
                '@ReactNativeTest:refreshToken'
            ];

            // Check that the expected keys are used in operations
            const setItemCalls = mockAsyncStorage.setItem.mock.calls;
            const getItemCalls = mockAsyncStorage.getItem.mock.calls;
            const removeItemCalls = mockAsyncStorage.removeItem.mock.calls;

            // Verify all storage keys are from our expected set
            setItemCalls.forEach((call: any[]) => {
                expect(expectedKeys.includes(call[0])).toBe(true);
            });

            getItemCalls.forEach((call: any[]) => {
                expect(expectedKeys.includes(call[0])).toBe(true);
            });

            removeItemCalls.forEach((call: any[]) => {
                expect(expectedKeys.includes(call[0])).toBe(true);
            });
        });
    });
});

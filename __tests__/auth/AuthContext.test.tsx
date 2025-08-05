// Authentication context test suite
// Testing React Context provider and state management

import React from 'react';
import { Text, View } from 'react-native';
import renderer from 'react-test-renderer';
import { AuthProvider, useAuth } from '../../src/auth/AuthContext';
import { AuthService } from '../../src/auth/authService';
import type { LoginResponse, VerificationResponse } from '../../src/auth/types';

// Mock AuthService
jest.mock('../../src/auth/authService');
const mockedAuthService = jest.mocked(AuthService);

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Test component to access useAuth hook
const TestComponent = ({ onRender }: { onRender?: (auth: ReturnType<typeof useAuth>) => void }) => {
    const auth = useAuth();

    React.useEffect(() => {
        if (onRender) {
            onRender(auth);
        }
    }, [auth, onRender]);

    return (
        <View>
            <Text testID="auth-state">
                {JSON.stringify({
                    isAuthenticated: auth.isAuthenticated,
                    userEmail: auth.user?.email,
                    hasToken: !!auth.user,
                    isLoading: auth.isLoading,
                    error: auth.error,
                })}
            </Text>
        </View>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockedAuthService.sendLoginEmail.mockResolvedValue({
            success: true,
            message: 'Code sent successfully',
            requestId: 'test-request-id'
        });

        mockedAuthService.verifyCode.mockResolvedValue({
            success: true,
            token: 'test-token',
            user: {
                id: 'test-user-id',
                email: 'test@example.com',
                isVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date()
            }
        });

        mockedAuthService.validateToken.mockResolvedValue({
            valid: true,
            user: {
                id: 'test-user-id',
                email: 'test@example.com',
                isVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date()
            }
        });
    });

    describe('useAuth hook', () => {
        test('throws error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                renderer.create(<TestComponent />);
            }).toThrow('useAuth must be used within an AuthProvider');

            consoleSpy.mockRestore();
        });

        test('provides initial state values', () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();
            expect(capturedAuth!.isAuthenticated).toBe(false);
            expect(capturedAuth!.user).toBeNull();
            expect(capturedAuth!.isLoading).toBe(false);
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('provides action functions', () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();
            expect(typeof capturedAuth!.login).toBe('function');
            expect(typeof capturedAuth!.verify).toBe('function');
            expect(typeof capturedAuth!.logout).toBe('function');
            expect(typeof capturedAuth!.clearError).toBe('function');
            expect(typeof capturedAuth!.checkAuthStatus).toBe('function');

            component.unmount();
        });
    });

    describe('authentication actions', () => {
        test('successfully sends login email', async () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            await capturedAuth!.login('test@example.com');

            expect(mockedAuthService.sendLoginEmail).toHaveBeenCalledWith('test@example.com');
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('handles send email failure', async () => {
            mockedAuthService.sendLoginEmail.mockResolvedValue({
                success: false,
                message: 'Email send failed'
            });

            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            await capturedAuth!.login('invalid@example.com');

            expect(capturedAuth!.error).toBe('Email send failed');

            component.unmount();
        });

        test('successfully verifies code and authenticates user', async () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            await capturedAuth!.verify('test@example.com', '123456');

            expect(mockedAuthService.verifyCode).toHaveBeenCalledWith('test@example.com', '123456');
            expect(capturedAuth!.isAuthenticated).toBe(true);
            expect(capturedAuth!.user).toBeDefined();
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('handles verification failure', async () => {
            mockedAuthService.verifyCode.mockResolvedValue({
                success: false,
                error: 'Invalid verification code'
            });

            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            await capturedAuth!.verify('test@example.com', '999999');

            expect(capturedAuth!.isAuthenticated).toBe(false);
            expect(capturedAuth!.user).toBeNull();
            expect(capturedAuth!.error).toBe('Invalid verification code');

            component.unmount();
        });

        test('clears authentication state on logout', async () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            // First authenticate
            await capturedAuth!.verify('test@example.com', '123456');
            expect(capturedAuth!.isAuthenticated).toBe(true);

            // Then logout
            await capturedAuth!.logout();

            expect(capturedAuth!.isAuthenticated).toBe(false);
            expect(capturedAuth!.user).toBeNull();
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('clears error state', async () => {
            mockedAuthService.sendLoginEmail.mockResolvedValue({
                success: false,
                message: 'Test error'
            });

            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            // Set an error
            await capturedAuth!.login('test@example.com');
            expect(capturedAuth!.error).toBe('Test error');

            // Clear the error
            capturedAuth!.clearError();
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });
    });

    describe('session restoration', () => {
        test('attempts to restore session on mount', async () => {
            const mockAsyncStorage = require('@react-native-async-storage/async-storage');
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
                token: 'stored-token',
                user: {
                    id: 'stored-user-id',
                    email: 'stored@example.com',
                    isVerified: true,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                }
            }));

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Wait for async restoration
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(mockedAuthService.validateToken).toHaveBeenCalledWith('stored-token');
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_credentials');

            component.unmount();
        });

        test('handles session restoration failure gracefully', async () => {
            const mockAsyncStorage = require('@react-native-async-storage/async-storage');
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
                token: 'invalid-token',
                user: { id: 'test' }
            }));

            mockedAuthService.validateToken.mockResolvedValue({
                valid: false
            });

            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            // Wait for async restoration
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(capturedAuth).not.toBeNull();
            expect(capturedAuth!.isAuthenticated).toBe(false);
            expect(capturedAuth!.user).toBeNull();

            component.unmount();
        });
    });

    describe('error handling', () => {
        test('handles network errors gracefully', async () => {
            mockedAuthService.sendLoginEmail.mockRejectedValue(new Error('Network error'));

            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            await capturedAuth!.login('test@example.com');

            expect(capturedAuth!.error).toBe('Network error occurred. Please try again.');
            expect(capturedAuth!.isLoading).toBe(false);

            component.unmount();
        });

        test('handles generic errors', async () => {
            mockedAuthService.verifyCode.mockRejectedValue(new Error('Unknown error'));

            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            expect(capturedAuth).not.toBeNull();

            await capturedAuth!.verify('test@example.com', '123456');

            expect(capturedAuth!.error).toBe('An unexpected error occurred. Please try again.');
            expect(capturedAuth!.isAuthenticated).toBe(false);

            component.unmount();
        });
    });
});

// Authentication context test suite
// Testing React Context provider and state management

import React from 'react';
import { Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '../../src/auth/AuthContext';
import { SupabaseAuthService } from '../../src/auth/supabaseAuthService';
import { AuthStorage } from '../../src/auth/storage';

// Mock SupabaseAuthService
jest.mock('../../src/auth/supabaseAuthService');
const mockedSupabaseAuthService = jest.mocked(SupabaseAuthService);

// Mock AuthStorage
jest.mock('../../src/auth/storage', () => ({
    AuthStorage: {
        getCredentials: jest.fn(),
        storeCredentials: jest.fn(),
        clearCredentials: jest.fn(),
    },
}));
const mockedAuthStorage = jest.mocked(AuthStorage);

// Mock auth utils (no longer needed but keeping for completeness)
jest.mock('../../src/auth/utils', () => ({
    validateEmail: jest.fn(),
    normalizeEmail: jest.fn(email => email.toLowerCase()),
}));

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

// Helper function to create component with auth context and wait for it to be ready
const createAuthTestComponent = async (): Promise<{
    component: renderer.ReactTestRenderer;
    capturedAuth: ReturnType<typeof useAuth>;
}> => {
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    const component = renderer.create(
        <AuthProvider>
            <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
    );

    // Wait for the component to render and context to be available
    await renderer.act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!capturedAuth) {
        throw new Error('Failed to capture auth context');
    }

    return { component, capturedAuth };
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockedSupabaseAuthService.sendLoginEmail.mockResolvedValue({
            success: true,
            message: 'Code sent successfully',
            requestId: 'test-request-id'
        });

        mockedSupabaseAuthService.verifyCode.mockResolvedValue({
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

        mockedSupabaseAuthService.getCurrentSession.mockResolvedValue(null);
        mockedSupabaseAuthService.signOut.mockResolvedValue();

        // Mock AuthStorage default behavior
        mockedAuthStorage.getCredentials.mockResolvedValue({
            token: null,
            email: null
        });
        mockedAuthStorage.storeCredentials.mockResolvedValue();
        mockedAuthStorage.clearCredentials.mockResolvedValue();
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

        test('provides initial state values', async () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            // Wait for initial render and async operations
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(capturedAuth).not.toBeNull();
            expect(capturedAuth!.isAuthenticated).toBe(false);
            expect(capturedAuth!.user).toBeNull();
            // After session check completes, loading should be false
            expect(capturedAuth!.isLoading).toBe(false);
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('provides action functions', async () => {
            let capturedAuth: ReturnType<typeof useAuth> | null = null;

            const component = renderer.create(
                <AuthProvider>
                    <TestComponent onRender={(auth) => { capturedAuth = auth; }} />
                </AuthProvider>
            );

            // Wait for initial render and async operations
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

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

            // Wait for initial render and async operations
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(capturedAuth).not.toBeNull();

            await act(async () => {
                await capturedAuth!.login('test@example.com');
            });

            expect(mockedSupabaseAuthService.sendLoginEmail).toHaveBeenCalledWith('test@example.com');
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('handles send email failure', async () => {
            mockedSupabaseAuthService.sendLoginEmail.mockResolvedValue({
                success: false,
                message: 'Email send failed'
            });

            const { component, capturedAuth } = await createAuthTestComponent();

            await renderer.act(async () => {
                await capturedAuth.login('invalid@example.com');
            });

            expect(capturedAuth.error).toBe('Email send failed');

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

            expect(mockedSupabaseAuthService.verifyCode).toHaveBeenCalledWith('test@example.com', '123456');
            expect(capturedAuth!.isAuthenticated).toBe(true);
            expect(capturedAuth!.user).toBeDefined();
            expect(capturedAuth!.error).toBeNull();

            component.unmount();
        });

        test('handles verification failure', async () => {
            mockedSupabaseAuthService.verifyCode.mockResolvedValue({
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
            mockedSupabaseAuthService.sendLoginEmail.mockResolvedValue({
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

            expect(mockedSupabaseAuthService.getCurrentSession).toHaveBeenCalled();
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_credentials');

            component.unmount();
        });

        test('handles session restoration failure gracefully', async () => {
            const mockAsyncStorage = require('@react-native-async-storage/async-storage');
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
                token: 'invalid-token',
                user: { id: 'test' }
            }));

            mockedSupabaseAuthService.getCurrentSession.mockResolvedValue(null);

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
            mockedSupabaseAuthService.sendLoginEmail.mockRejectedValue(new Error('Network error'));

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
            mockedSupabaseAuthService.verifyCode.mockRejectedValue(new Error('Unknown error'));

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

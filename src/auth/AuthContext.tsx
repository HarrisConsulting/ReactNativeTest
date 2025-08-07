// Authentication Context for ReactNativeTest
// Provides global authentication state management

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
    AuthState,
    AuthContextType,
    User,
    LoginResponse,
    VerificationResponse
} from './types';
import { SupabaseAuthService } from './supabaseAuthService';
import { AuthStorage } from './storage';

// Initial authentication state
const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: true, // Start with loading to check stored credentials
    error: null,
    pendingEmail: null,
};

// Action types for reducer
type AuthAction =
    | { type: 'AUTH_START_LOADING' }
    | { type: 'AUTH_STOP_LOADING' }
    | { type: 'AUTH_LOGIN_START'; payload: { email: string } }
    | { type: 'AUTH_LOGIN_SUCCESS'; payload: { email: string } }
    | { type: 'AUTH_LOGIN_ERROR'; payload: { error: string } }
    | { type: 'AUTH_VERIFY_SUCCESS'; payload: { user: User } }
    | { type: 'AUTH_VERIFY_ERROR'; payload: { error: string } }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'AUTH_CLEAR_ERROR' }
    | { type: 'AUTH_RESTORE_SESSION'; payload: { user: User } }
    | { type: 'AUTH_UPDATE_PROFILE'; payload: { preferredName?: string; preferences?: import('./types').UserPreferences } };

// Authentication reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START_LOADING':
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case 'AUTH_STOP_LOADING':
            return {
                ...state,
                isLoading: false,
            };

        case 'AUTH_LOGIN_START':
            return {
                ...state,
                isLoading: true,
                error: null,
                pendingEmail: action.payload.email,
            };

        case 'AUTH_LOGIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                error: null,
                pendingEmail: action.payload.email,
            };

        case 'AUTH_LOGIN_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
                pendingEmail: null,
            };

        case 'AUTH_VERIFY_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                error: null,
                pendingEmail: null,
            };

        case 'AUTH_VERIFY_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };

        case 'AUTH_LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null,
                pendingEmail: null,
            };

        case 'AUTH_CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };

        case 'AUTH_RESTORE_SESSION':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                isLoading: false,
                error: null,
            };

        case 'AUTH_UPDATE_PROFILE':
            return {
                ...state,
                user: state.user ? {
                    ...state.user,
                    preferredName: action.payload.preferredName ?? state.user.preferredName,
                    preferences: action.payload.preferences ?? state.user.preferences
                } : null,
            };

        default:
            return state;
    }
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component props
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing authentication session on app start
    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async (): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START_LOADING' });

            // Try to get current session from Supabase
            const session = await SupabaseAuthService.getCurrentSession();

            if (session && session.user) {
                // Convert Supabase user to our User type
                const user: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    isVerified: true,
                    createdAt: new Date(),
                    lastLoginAt: new Date()
                };

                dispatch({
                    type: 'AUTH_RESTORE_SESSION',
                    payload: { user }
                });
            } else {
                dispatch({ type: 'AUTH_STOP_LOADING' });
            }
        } catch (error) {
            console.error('Session restoration error:', error);
            dispatch({ type: 'AUTH_STOP_LOADING' });
        }
    }; const login = async (email: string): Promise<LoginResponse> => {
        try {
            dispatch({ type: 'AUTH_LOGIN_START', payload: { email } });

            const response = await SupabaseAuthService.sendLoginEmail(email);

            if (response.success) {
                dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: { email } });
            } else {
                dispatch({ type: 'AUTH_LOGIN_ERROR', payload: { error: response.message } });
            }

            return response;
        } catch (error) {
            const errorMessage = 'Failed to send login email. Please try again.';
            dispatch({ type: 'AUTH_LOGIN_ERROR', payload: { error: errorMessage } });

            return {
                success: false,
                message: errorMessage,
            };
        }
    };

    const verify = async (email: string, code: string): Promise<VerificationResponse> => {
        try {
            dispatch({ type: 'AUTH_START_LOADING' });

            const response = await SupabaseAuthService.verifyCode(email, code);

            if (response.success && response.user && response.token) {
                // Store credentials for future sessions
                const token = {
                    token: response.token,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                };

                await AuthStorage.storeCredentials(token, email);

                dispatch({
                    type: 'AUTH_VERIFY_SUCCESS',
                    payload: { user: response.user }
                });
            } else {
                dispatch({
                    type: 'AUTH_VERIFY_ERROR',
                    payload: { error: response.error || 'Verification failed' }
                });
            }

            return response;
        } catch (error) {
            const errorMessage = 'Verification failed. Please try again.';
            dispatch({ type: 'AUTH_VERIFY_ERROR', payload: { error: errorMessage } });

            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Clear stored credentials
            await AuthStorage.clearCredentials();

            // Sign out from Supabase
            await SupabaseAuthService.signOut();

            // Update state
            dispatch({ type: 'AUTH_LOGOUT' });
        } catch (error) {
            console.error('Logout error:', error);
            // Even if storage clearing fails, update the state
            dispatch({ type: 'AUTH_LOGOUT' });
        }
    };

    const clearError = (): void => {
        dispatch({ type: 'AUTH_CLEAR_ERROR' });
    };

    const checkAuthStatus = async (): Promise<void> => {
        await checkExistingSession();
    };

    // Real implementations for preference management
    const updatePreferredName = async (name: string): Promise<{ success: boolean; error?: string }> => {
        if (!name.trim()) {
            return { success: false, error: 'Preferred name cannot be empty' };
        }

        if (name.trim().length > 50) {
            return { success: false, error: 'Preferred name must be 50 characters or less' };
        }

        const result = await SupabaseAuthService.updatePreferredName(name);

        if (result.success) {
            // Refresh user profile to get updated data
            await refreshUserProfile();
        }

        return result;
    };

    const updateUserPreferences = async (preferences: Partial<import('./types').UserPreferences>): Promise<{ success: boolean; error?: string }> => {
        const result = await SupabaseAuthService.updateUserPreferences(preferences);

        if (result.success) {
            // Refresh user profile to get updated data
            await refreshUserProfile();
        }

        return result;
    };

    const refreshUserProfile = async (): Promise<void> => {
        if (!state.user?.id) return;

        try {
            const profile = await SupabaseAuthService.getUserProfile(state.user.id);

            if (profile) {
                // Update the user state with profile data using dispatch
                dispatch({
                    type: 'AUTH_UPDATE_PROFILE',
                    payload: {
                        preferredName: profile.preferredName,
                        preferences: profile.preferences
                    }
                });
            }
        } catch (error) {
            console.error('Failed to refresh user profile:', error);
        }
    };

    const contextValue: AuthContextType = {
        ...state,
        login,
        verify,
        logout,
        clearError,
        checkAuthStatus,
        updatePreferredName,
        updateUserPreferences,
        refreshUserProfile,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use authentication context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

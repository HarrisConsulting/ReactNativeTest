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
import { AuthService } from './authService';
import { AuthStorage } from './storage';
import { checkTokenExpiration } from './utils';

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
    | { type: 'AUTH_RESTORE_SESSION'; payload: { user: User } };

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

            const { token, email } = await AuthStorage.getCredentials();

            if (!token || !email) {
                dispatch({ type: 'AUTH_STOP_LOADING' });
                return;
            }

            // Check if token is still valid
            if (!checkTokenExpiration(token)) {
                // Token expired, clear stored credentials
                await AuthStorage.clearCredentials();
                dispatch({ type: 'AUTH_STOP_LOADING' });
                return;
            }

            // Validate token with service
            const validation = await AuthService.validateToken(token.token);

            if (validation.valid && validation.user) {
                dispatch({
                    type: 'AUTH_RESTORE_SESSION',
                    payload: { user: validation.user }
                });
            } else {
                // Invalid token, clear stored credentials
                await AuthStorage.clearCredentials();
                dispatch({ type: 'AUTH_STOP_LOADING' });
            }
        } catch (error) {
            console.error('Session restoration error:', error);
            // Clear potentially corrupted credentials
            await AuthStorage.clearCredentials();
            dispatch({ type: 'AUTH_STOP_LOADING' });
        }
    };

    const login = async (email: string): Promise<LoginResponse> => {
        try {
            dispatch({ type: 'AUTH_LOGIN_START', payload: { email } });

            const response = await AuthService.sendLoginEmail(email);

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

            const response = await AuthService.verifyCode(email, code);

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

    const contextValue: AuthContextType = {
        ...state,
        login,
        verify,
        logout,
        clearError,
        checkAuthStatus,
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

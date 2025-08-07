// Authentication type definitions for ReactNativeTest
// Following enterprise-grade TypeScript patterns

export interface User {
    id: string;
    email: string;
    createdAt: Date;
    lastLoginAt: Date;
    isVerified: boolean;
    preferredName?: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    notifications?: NotificationPreferences;
    device?: DevicePreferences;
    gameTypes?: GameType[];
    theme?: 'light' | 'dark';
    accessibility?: AccessibilityPreferences;
}

export type GameType = 'Arcade' | 'Strategy' | 'RPG' | 'Puzzle' | 'Action' | 'Sports';

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
}

export interface DevicePreferences {
    rememberDevice: boolean;
    sessionExtension?: boolean;
}

export interface AccessibilityPreferences {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
}

export interface AuthToken {
    token: string;
    expiresAt: Date;
    refreshToken?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    pendingEmail: string | null; // Email waiting for verification
}

export interface LoginRequest {
    email: string;
}

export interface VerificationRequest {
    email: string;
    code: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    requestId?: string;
}

export interface VerificationResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
    message?: string; // Additional descriptive message for specific error cases
}

export interface AuthActions {
    login: (email: string) => Promise<LoginResponse>;
    verify: (email: string, code: string) => Promise<VerificationResponse>;
    logout: () => Promise<void>;
    clearError: () => void;
    checkAuthStatus: () => Promise<void>;
    updatePreferredName: (name: string) => Promise<{ success: boolean; error?: string }>;
    updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>;
    refreshUserProfile: () => Promise<void>;
}

export interface AuthContextType extends AuthState, AuthActions { }

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface AuthConfig {
    apiEndpoint: string;
    tokenExpiration: number;
    maxLoginAttempts: number;
    codeLength: number;
}

// Navigation parameter types for auth flow
export interface AuthNavigationParams {
    returnTo?: string;
    email?: string;
}

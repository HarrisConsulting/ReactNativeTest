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
    gamePreferences?: GamePreferences;
    theme?: 'light' | 'dark';
    accessibility?: AccessibilityPreferences;
}

// Comprehensive Game Preferences System
export interface GamePreferences {
    strategyBoardGames?: StrategyBoardGame[];
    puzzleGames?: PuzzleGame[];
    arcadeGames?: ArcadeGame[];
    actionGames?: ActionGame[];
    sportsGames?: SportsGame[];
    skillLevel?: SkillLevel;
    preferredSessionLength?: SessionLength;
    competitiveMode?: boolean;
}

export type StrategyBoardGame = 'Chess' | 'Checkers' | 'Backgammon' | 'Go' | 'Othello' | 'Shogi';
export type PuzzleGame = 'Tetris' | 'Rubik\'s Cube' | 'Sudoku' | 'Crossword' | 'Jigsaw' | 'Word Search';
export type ArcadeGame = 'Pac-Man' | 'Space Invaders' | 'Donkey Kong' | 'Frogger' | 'Asteroids' | 'Centipede';
export type ActionGame = 'Call of Duty' | 'God of War' | 'Street Fighter' | 'Mortal Kombat' | 'Tekken' | 'Doom';
export type SportsGame = 'Soccer' | 'Golf' | 'Tennis' | 'Basketball' | 'Baseball' | 'Football';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SessionLength = '5-15 minutes' | '15-30 minutes' | '30-60 minutes' | '1+ hours';

// Legacy support for simple game types (maintained for backward compatibility)
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

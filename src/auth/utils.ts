// Authentication utility functions for ReactNativeTest
// Following zero-warning code quality standards

import { ValidationResult, AuthToken } from './types';

// Email validation with comprehensive regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const DISPOSABLE_EMAIL_DOMAINS = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    // Add more as needed for production
];

export const validateEmail = (email: string): ValidationResult => {
    // Check for empty or null email
    if (!email || email.trim().length === 0) {
        return {
            isValid: false,
            error: 'Email address is required',
        };
    }

    const trimmedEmail = email.trim();

    // Check for whitespace in email
    if (trimmedEmail !== email || trimmedEmail.includes(' ')) {
        return {
            isValid: false,
            error: 'Please enter a valid email address',
        };
    }

    // Check basic email format
    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return {
            isValid: false,
            error: 'Please enter a valid email address',
        };
    }

    // Check email length (reasonable limits)
    if (trimmedEmail.length > 254) {
        return {
            isValid: false,
            error: 'Email address is too long',
        };
    }

    // Check for consecutive dots
    if (trimmedEmail.includes('..')) {
        return {
            isValid: false,
            error: 'Please enter a valid email address',
        };
    }

    // Check for valid domain
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2 || !parts[1] || !parts[1].includes('.')) {
        return {
            isValid: false,
            error: 'Please enter a valid email address',
        };
    }

    // Check for disposable email domains (optional security measure)
    const domain = parts[1].toLowerCase();
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
        return {
            isValid: false,
            error: 'Please use a permanent email address',
        };
    }

    return { isValid: true };
};

// OTP code validation
export const validateOTPCode = (code: string): ValidationResult => {
    // Check for empty or null code first
    if (!code || code.trim().length === 0) {
        return {
            isValid: false,
            error: 'Verification code is required',
        };
    }

    // Check if code is exactly 6 digits
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
        return {
            isValid: false,
            error: 'Verification code must be 6 digits',
        };
    }

    return { isValid: true };
};

// Generate secure verification code (for demo purposes)
export const generateSecureCode = (): string => {
    // In production, this would be done server-side
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash email for security (simplified version)
export const hashEmail = (email: string): string => {
    // In production, use proper cryptographic hashing
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        // Use bitwise operations for hash generation
        // eslint-disable-next-line no-bitwise
        hash = ((hash << 5) - hash) + char;
        // eslint-disable-next-line no-bitwise
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
};

// Token validation utilities
export const validateTokenFormat = (token: string): boolean => {
    // Basic token format validation
    return !!(token && token.length > 10 && /^[A-Za-z0-9._-]+$/.test(token));
};

export const checkTokenExpiration = (token: AuthToken): boolean => {
    const now = new Date();
    const expirationDate = new Date(token.expiresAt);
    return now < expirationDate;
};

// Normalize email for consistent storage
export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

// Generate demo authentication token
export const generateDemoToken = (email: string): AuthToken => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return {
        token: `demo_token_${hashEmail(email)}_${now.getTime()}`,
        expiresAt,
        refreshToken: `refresh_${hashEmail(email)}_${now.getTime()}`,
    };
};

// Format display email (mask for privacy when needed)
export const formatDisplayEmail = (email: string, maskDomain = false): string => {
    if (!email) return '';

    if (maskDomain) {
        const [local, domain] = email.split('@');
        if (local && domain) {
            const maskedLocal = local.length > 2
                ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
                : local;
            const maskedDomain = domain.length > 4
                ? `${'*'.repeat(domain.length - 4)}${domain.slice(-4)}`
                : domain;
            return `${maskedLocal}@${maskedDomain}`;
        }
    }

    return email;
};

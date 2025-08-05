// Mock authentication service for ReactNativeTest
// Simulates email-only authentication flow for demo purposes

import {
    LoginResponse,
    VerificationResponse,
    User
} from './types';
import { validateEmail, validateOTPCode, generateDemoToken, normalizeEmail } from './utils';

// Demo configuration
const DEMO_CONFIG = {
    emailSendDelay: 1500, // Simulate network delay
    verificationDelay: 1000,
    validOTPCode: '123456', // Demo OTP code
    maxLoginAttempts: 5,
};

// In-memory storage for demo purposes
let demoUsers: Map<string, User> = new Map();
let pendingVerifications: Map<string, { code: string; email: string; timestamp: number }> = new Map();

export class AuthService {
    // Simulate sending login email with OTP
    static async sendLoginEmail(email: string): Promise<LoginResponse> {
        // Validate email format
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return {
                success: false,
                message: emailValidation.error || 'Invalid email format',
            };
        }

        const normalizedEmail = normalizeEmail(email);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.emailSendDelay));

        try {
            // Generate demo verification code
            const verificationCode = DEMO_CONFIG.validOTPCode;
            const timestamp = Date.now();

            // Store pending verification
            pendingVerifications.set(normalizedEmail, {
                code: verificationCode,
                email: normalizedEmail,
                timestamp,
            });

            // In a real app, this would send an actual email
            console.log(`🔐 Demo Login Code for ${normalizedEmail}: ${verificationCode}`);

            return {
                success: true,
                message: `Verification code sent to ${email}`,
                requestId: `req_${timestamp}`,
            };
        } catch (error) {
            console.error('Mock email send error:', error);
            return {
                success: false,
                message: 'Failed to send verification email. Please try again.',
            };
        }
    }

    // Simulate OTP verification
    static async verifyCode(email: string, code: string): Promise<VerificationResponse> {
        // Validate inputs
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return {
                success: false,
                error: emailValidation.error || 'Invalid email format',
            };
        }

        const codeValidation = validateOTPCode(code);
        if (!codeValidation.isValid) {
            return {
                success: false,
                error: codeValidation.error || 'Invalid verification code',
            };
        }

        const normalizedEmail = normalizeEmail(email);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.verificationDelay));

        try {
            // Check if there's a pending verification for this email
            const pending = pendingVerifications.get(normalizedEmail);
            if (!pending) {
                return {
                    success: false,
                    error: 'No verification request found. Please request a new code.',
                };
            }

            // Check if code has expired (10 minutes for demo)
            const isExpired = Date.now() - pending.timestamp > 10 * 60 * 1000;
            if (isExpired) {
                pendingVerifications.delete(normalizedEmail);
                return {
                    success: false,
                    error: 'Verification code has expired. Please request a new code.',
                };
            }

            // Verify the code
            if (pending.code !== code.trim()) {
                return {
                    success: false,
                    error: 'Invalid verification code. Please try again.',
                };
            }

            // Code is valid - create or update user
            let user = demoUsers.get(normalizedEmail);
            const now = new Date();

            if (!user) {
                // New user
                user = {
                    id: `user_${Date.now()}`,
                    email: normalizedEmail,
                    createdAt: now,
                    lastLoginAt: now,
                    isVerified: true,
                };
                demoUsers.set(normalizedEmail, user);
            } else {
                // Existing user
                user.lastLoginAt = now;
                user.isVerified = true;
            }

            // Generate authentication token
            const token = generateDemoToken(normalizedEmail);

            // Clean up pending verification
            pendingVerifications.delete(normalizedEmail);

            return {
                success: true,
                token: token.token,
                user,
            };
        } catch (error) {
            console.error('Mock verification error:', error);
            return {
                success: false,
                error: 'Verification failed. Please try again.',
            };
        }
    }

    // Simulate token validation
    static async validateToken(token: string): Promise<{ valid: boolean; user?: User }> {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        try {
            // In a real app, this would validate with the server
            // For demo, we'll check if the token format is correct and find the associated user

            if (!token || token.length < 10) {
                return { valid: false };
            }

            // Extract email hash from demo token format
            const tokenParts = token.split('_');
            if (tokenParts.length < 3 || tokenParts[0] !== 'demo' || tokenParts[1] !== 'token') {
                return { valid: false };
            }

            // Find user by checking all demo users (simplified for demo)
            for (const [email, user] of demoUsers) {
                const userToken = generateDemoToken(email);
                if (userToken.token === token) {
                    // Check if token is still valid (not expired)
                    const isExpired = new Date() > userToken.expiresAt;
                    if (isExpired) {
                        return { valid: false };
                    }

                    return { valid: true, user };
                }
            }

            return { valid: false };
        } catch (error) {
            console.error('Mock token validation error:', error);
            return { valid: false };
        }
    }

    // Simulate magic link verification (future enhancement)
    static async verifyMagicLink(_token: string): Promise<VerificationResponse> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For now, return not implemented
        return {
            success: false,
            error: 'Magic link authentication not implemented in demo',
        };
    }

    // Get demo users (for debugging)
    static getDemoUsers(): Map<string, User> {
        return new Map(demoUsers);
    }

    // Clear demo data (for testing)
    static clearDemoData(): void {
        demoUsers.clear();
        pendingVerifications.clear();
    }

    // Resend verification code
    static async resendVerificationCode(email: string): Promise<LoginResponse> {
        // Simply call sendLoginEmail again
        return this.sendLoginEmail(email);
    }
}

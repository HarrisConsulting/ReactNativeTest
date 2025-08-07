import { supabase } from '../services/supabase';
import { validateEmail } from './utils';
import { normalizeEmail } from '../utils/emailUtils';
import { isNetworkAvailable } from '../utils/networkUtils';
import { withRateLimit } from '../hooks/useRateLimit';
import { logAuthDebug, logAuthError, authPerformanceTracker } from '../services/debugUtils';
import type {
    LoginResponse,
    VerificationResponse,
    User
} from './types';

export class SupabaseAuthService {
    // Check if email is whitelisted
    static async isEmailWhitelisted(email: string): Promise<boolean> {
        try {
            const normalizedEmail = normalizeEmail(email);
            logAuthDebug('whitelist-check-start', { email: normalizedEmail });

            const { data, error } = await supabase
                .from('email_whitelist')
                .select('email')
                .eq('email', normalizedEmail)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                logAuthError('whitelist-check-error', error, { email: normalizedEmail });
                return false;
            }

            const isWhitelisted = !!data;
            logAuthDebug('whitelist-check-result', { email: normalizedEmail, isWhitelisted });
            return isWhitelisted;
        } catch (error) {
            logAuthError('whitelist-check-exception', error, { email });
            return false;
        }
    }

    // Send OTP code email (with rate limiting)
    static sendLoginEmail = withRateLimit(
        async (email: string): Promise<LoginResponse> => {
            authPerformanceTracker.start('send-otp-code');

            try {
                // Check network connectivity first
                const hasNetwork = await isNetworkAvailable();
                if (!hasNetwork) {
                    return {
                        success: false,
                        message: 'No internet connection. Please check your network and try again.',
                    };
                }

                // Validate email format
                const emailValidation = validateEmail(email);
                if (!emailValidation.isValid) {
                    return {
                        success: false,
                        message: emailValidation.error || 'Invalid email format',
                    };
                }

                const normalizedEmail = normalizeEmail(email);
                logAuthDebug('send-otp-code-start', { email: normalizedEmail });

                // Check if email is whitelisted
                const isWhitelisted = await this.isEmailWhitelisted(normalizedEmail);
                if (!isWhitelisted) {
                    logAuthDebug('send-otp-code-not-whitelisted', { email: normalizedEmail });
                    return {
                        success: false,
                        message: 'Email address is not authorized for access.',
                    };
                }

                // Send OTP code via email (minimal configuration for OTP-only)
                const { error } = await supabase.auth.signInWithOtp({
                    email: normalizedEmail,
                });

                if (error) {
                    logAuthError('send-otp-code-error', error, { email: normalizedEmail });
                    return {
                        success: false,
                        message: 'Failed to send verification email. Please try again.',
                    };
                }

                logAuthDebug('send-otp-code-success', { email: normalizedEmail });
                return {
                    success: true,
                    message: `Verification code sent to ${email}`,
                };
            } catch (error) {
                logAuthError('send-otp-code-exception', error, { email });
                return {
                    success: false,
                    message: 'Failed to send verification email. Please try again.',
                };
            } finally {
                authPerformanceTracker.end('send-otp-code');
            }
        },
        'send-otp-code',
        60000 // 1 minute rate limit
    );

    // Verify OTP code (for manual entry)
    static async verifyCode(email: string, code: string): Promise<VerificationResponse> {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email.toLowerCase().trim(),
                token: code,
                type: 'email',
            });

            if (error) {
                console.error('OTP verification error:', error);
                return {
                    success: false,
                    error: 'Invalid verification code. Please try again.',
                };
            }

            if (!data.session || !data.user) {
                return {
                    success: false,
                    error: 'Verification failed. Please try again.',
                };
            }

            // Create or update user profile
            await this.createOrUpdateUserProfile(data.user);

            const user: User = {
                id: data.user.id,
                email: data.user.email!,
                createdAt: new Date(data.user.created_at),
                lastLoginAt: new Date(),
                isVerified: true,
            };

            return {
                success: true,
                user,
                token: data.session.access_token,
            };
        } catch (error) {
            console.error('Code verification error:', error);
            return {
                success: false,
                error: 'Verification failed. Please try again.',
            };
        }
    }

    // Create or update user profile
    private static async createOrUpdateUserProfile(user: any): Promise<void> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    last_login_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Profile creation/update error:', error);
            }
        } catch (error) {
            console.error('Profile operation failed:', error);
        }
    }

    // Get current session
    static async getCurrentSession(): Promise<{ user: User; token: string } | null> {
        try {
            const { data, error } = await supabase.auth.getSession();
            const session = data?.session;

            if (error || !session || !session.user) {
                return null;
            }

            const user: User = {
                id: session.user.id,
                email: session.user.email!,
                createdAt: new Date(session.user.created_at),
                lastLoginAt: new Date(),
                isVerified: true,
            };

            return {
                user,
                token: session.access_token,
            };
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    // Sign out
    static async signOut(): Promise<void> {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Sign out error:', error);
            }
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }
}

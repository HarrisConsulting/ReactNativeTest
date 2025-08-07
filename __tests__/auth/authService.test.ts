// Authentication service test suite
// Testing mock authentication flows and API responses

import { AuthService } from '../../src/auth/authService';

// Mock console.log to avoid test output pollution
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
});

describe('AuthService', () => {
    beforeEach(() => {
        // Clear demo data before each test
        AuthService.clearDemoData();
        jest.clearAllMocks();
    });

    describe('sendLoginEmail', () => {
        test('sends email successfully with valid email', async () => {
            const email = 'test@example.com';
            const response = await AuthService.sendLoginEmail(email);

            expect(response.success).toBe(true);
            expect(response.message).toContain('Verification code sent');
            expect(response.requestId).toBeDefined();
        });

        test('rejects invalid email formats', async () => {
            const invalidEmail = 'invalid-email';
            const response = await AuthService.sendLoginEmail(invalidEmail);

            expect(response.success).toBe(false);
            expect(response.message).toContain('valid email address');
        });

        test('handles empty email', async () => {
            const response = await AuthService.sendLoginEmail('');

            expect(response.success).toBe(false);
            expect(response.message).toBe('Email address is required');
        });

        test('normalizes email addresses', async () => {
            const email = 'Test@Example.COM';
            const response = await AuthService.sendLoginEmail(email);

            expect(response.success).toBe(true);
            // Verify that subsequent operations work with normalized email
            const verifyResponse = await AuthService.verifyCode('test@example.com', '123456');
            expect(verifyResponse.success).toBe(true);
        });

        test('allows resending to same email', async () => {
            const email = 'test@example.com';

            const response1 = await AuthService.sendLoginEmail(email);
            expect(response1.success).toBe(true);

            const response2 = await AuthService.sendLoginEmail(email);
            expect(response2.success).toBe(true);
        });
    });

    describe('verifyCode', () => {
        test('verifies valid OTP codes', async () => {
            const email = 'test@example.com';

            // First send login email
            await AuthService.sendLoginEmail(email);

            // Then verify with correct code
            const response = await AuthService.verifyCode(email, '123456');

            expect(response.success).toBe(true);
            expect(response.token).toBeDefined();
            expect(response.user).toBeDefined();
            expect(response.user?.email).toBe(email);
        });

        test('rejects invalid OTP codes', async () => {
            const email = 'test@example.com';

            await AuthService.sendLoginEmail(email);

            const response = await AuthService.verifyCode(email, '999999');

            expect(response.success).toBe(false);
            expect(response.error).toContain('Invalid verification code');
        });

        test('rejects verification without login request', async () => {
            const email = 'test@example.com';

            const response = await AuthService.verifyCode(email, '123456');

            expect(response.success).toBe(false);
            expect(response.error).toContain('No verification request found');
        });

        test('handles expired verification codes', async () => {
            // Create a custom verification with an expired timestamp
            const email = 'test@example.com';
            const normalizedEmail = email.toLowerCase().trim();

            // Get access to internal data structures
            const pendingVerifications = AuthService.getPendingVerifications();

            // Manually add an expired verification instead of using sendLoginEmail
            const expiredTimestamp = Date.now() - (11 * 60 * 1000); // 11 minutes ago
            pendingVerifications.set(normalizedEmail, {
                code: '123456',
                email: normalizedEmail,
                timestamp: expiredTimestamp,
            });

            const response = await AuthService.verifyCode(email, '123456');

            expect(response.success).toBe(false);
            expect(response.error).toContain('expired');
        }); test('creates new user on first successful verification', async () => {
            const email = 'newuser@example.com';

            await AuthService.sendLoginEmail(email);
            const response = await AuthService.verifyCode(email, '123456');

            expect(response.success).toBe(true);
            expect(response.user?.id).toBeDefined();
            expect(response.user?.email).toBe(email);
            expect(response.user?.isVerified).toBe(true);
            expect(response.user?.createdAt).toBeInstanceOf(Date);
        });

        test('updates existing user on subsequent logins', async () => {
            const email = 'existinguser@example.com';

            // First login
            await AuthService.sendLoginEmail(email);
            const firstResponse = await AuthService.verifyCode(email, '123456');
            const firstLoginTime = firstResponse.user?.lastLoginAt;

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 10));

            // Second login
            await AuthService.sendLoginEmail(email);
            const secondResponse = await AuthService.verifyCode(email, '123456');
            const secondLoginTime = secondResponse.user?.lastLoginAt;

            expect(firstResponse.success).toBe(true);
            expect(secondResponse.success).toBe(true);
            expect(secondLoginTime?.getTime()).toBeGreaterThan(firstLoginTime?.getTime() || 0);
        }, 10000); // 10 second timeout

        test('validates email format before verification', async () => {
            const response = await AuthService.verifyCode('invalid-email', '123456');

            expect(response.success).toBe(false);
            expect(response.error).toContain('valid email address');
        });

        test('validates OTP code format', async () => {
            const email = 'test@example.com';
            await AuthService.sendLoginEmail(email);

            const response = await AuthService.verifyCode(email, '12345'); // 5 digits

            expect(response.success).toBe(false);
            expect(response.error).toContain('6 digits');
        });
    });

    describe('validateToken', () => {
        test('validates valid tokens', async () => {
            const email = 'test@example.com';

            // Complete login flow to get token
            await AuthService.sendLoginEmail(email);
            const verifyResponse = await AuthService.verifyCode(email, '123456');
            const token = verifyResponse.token!;

            const validation = await AuthService.validateToken(token);

            expect(validation.valid).toBe(true);
            expect(validation.user).toBeDefined();
            expect(validation.user?.email).toBe(email);
        });

        test('rejects invalid token formats', async () => {
            const invalidTokens = ['short', '', 'invalid_format'];

            for (const token of invalidTokens) {
                const validation = await AuthService.validateToken(token);
                expect(validation.valid).toBe(false);
                expect(validation.user).toBeUndefined();
            }
        });

        test('rejects tokens for non-existent users', async () => {
            const fakeToken = 'demo_token_fakehash_1234567890';

            const validation = await AuthService.validateToken(fakeToken);

            expect(validation.valid).toBe(false);
            expect(validation.user).toBeUndefined();
        });
    });

    describe('resendVerificationCode', () => {
        test('allows resending verification code', async () => {
            const email = 'test@example.com';

            const firstResponse = await AuthService.sendLoginEmail(email);
            const resendResponse = await AuthService.resendVerificationCode(email);

            expect(firstResponse.success).toBe(true);
            expect(resendResponse.success).toBe(true);
            expect(resendResponse.message).toContain('Verification code sent');
        });
    });

    describe('demo data management', () => {
        test('can retrieve demo users', () => {
            const users = AuthService.getDemoUsers();
            expect(users).toBeInstanceOf(Map);
        });

        test('can clear demo data', () => {
            AuthService.clearDemoData();
            const users = AuthService.getDemoUsers();
            expect(users.size).toBe(0);
        });
    });

    describe('network simulation', () => {
        test('simulates network delays', async () => {
            const startTime = Date.now();
            await AuthService.sendLoginEmail('test@example.com');
            const endTime = Date.now();

            // Should take at least 1 second (simulated delay)
            expect(endTime - startTime).toBeGreaterThan(1000);
        });
    });
});

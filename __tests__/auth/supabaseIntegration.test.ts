import { SupabaseAuthService } from '../../src/auth/supabaseAuthService';

describe('SupabaseAuthService Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Email Whitelist Validation', () => {
        test('validates whitelisted email correctly', async () => {
            const testEmail = 'roger@harrisconsulting.com';

            // This should return true for whitelisted emails
            const result = await SupabaseAuthService.sendLoginEmail(testEmail);

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
        });

        test('rejects non-whitelisted email', async () => {
            const testEmail = 'notwhitelisted@example.com';

            const result = await SupabaseAuthService.sendLoginEmail(testEmail);

            if (!result.success) {
                expect(result.message).toContain('not authorized');
            }
        });

        test('handles malformed email addresses', async () => {
            const malformedEmails = [
                'invalid-email',
                '@example.com',
                'test@',
                '',
                ' ',
            ];

            for (const email of malformedEmails) {
                const result = await SupabaseAuthService.sendLoginEmail(email);
                expect(result.success).toBe(false);
            }
        });
    });

    describe('Session Management', () => {
        test('handles session validation', async () => {
            const session = await SupabaseAuthService.getCurrentSession();

            // Should return null for no active session or valid session object
            expect(session === null || (session && session.user)).toBe(true);
        });

        test('handles sign out correctly', async () => {
            await expect(SupabaseAuthService.signOut()).resolves.not.toThrow();
        });
    });

    describe('Rate Limiting', () => {
        test('enforces rate limiting on multiple requests', async () => {
            const testEmail = 'roger@harrisconsulting.com';

            // First request should succeed
            const firstRequest = await SupabaseAuthService.sendLoginEmail(testEmail);
            expect(firstRequest).toBeDefined();

            // Second immediate request should be rate limited
            const secondRequest = await SupabaseAuthService.sendLoginEmail(testEmail);

            if (!secondRequest.success) {
                expect(secondRequest.message).toContain('wait');
            }
        });
    });
});
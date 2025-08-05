// Authentication utilities test suite
// Testing email validation, OTP validation, and utility functions

import {
    validateEmail,
    validateOTPCode,
    generateSecureCode,
    hashEmail,
    validateTokenFormat,
    checkTokenExpiration,
    normalizeEmail,
    generateDemoToken,
    formatDisplayEmail,
} from '../../src/auth/utils';
import { AuthToken } from '../../src/auth/types';

describe('Email Validation', () => {
    test('validates correct email formats', () => {
        const validEmails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'test+tag@gmail.com',
            'user123@test-domain.com',
            'a@b.co',
        ];

        validEmails.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    test('rejects invalid email formats', () => {
        const invalidEmails = [
            'invalid-email',
            '@example.com',
            'test@',
            'test..test@example.com',
            'test@example',
            'test @example.com',
            'test@example .com',
        ];

        invalidEmails.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    test('handles edge cases (empty, null, undefined)', () => {
        const edgeCases = ['', '   ', null as any, undefined as any];

        edgeCases.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Email address is required');
        });
    });

    test('validates international email formats', () => {
        const internationalEmails = [
            'user@example.jp',
            'test@domain.co.uk',
            'email@subdomain.domain.com',
        ];

        internationalEmails.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(true);
        });
    });

    test('rejects emails that are too long', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const result = validateEmail(longEmail);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Email address is too long');
    });

    test('rejects disposable email domains', () => {
        const disposableEmails = [
            'test@10minutemail.com',
            'user@tempmail.org',
            'email@guerrillamail.com',
        ];

        disposableEmails.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Please use a permanent email address');
        });
    });
});

describe('OTP Code Validation', () => {
    test('validates 6-digit numeric codes', () => {
        const validCodes = ['123456', '000000', '999999', '654321'];

        validCodes.forEach(code => {
            const result = validateOTPCode(code);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    test('rejects non-numeric codes', () => {
        const invalidCodes = ['abcdef', '12345a', 'a12345', '12a345'];

        invalidCodes.forEach(code => {
            const result = validateOTPCode(code);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Verification code must be 6 digits');
        });
    });

    test('rejects codes with wrong length', () => {
        const wrongLengthCodes = ['12345', '1234567', '123', ''];

        wrongLengthCodes.forEach(code => {
            const result = validateOTPCode(code);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Verification code must be 6 digits');
        });
    });

    test('handles whitespace correctly', () => {
        const codeWithWhitespace = '  123456  ';
        const result = validateOTPCode(codeWithWhitespace);
        expect(result.isValid).toBe(true);
    });

    test('handles empty and null values', () => {
        const emptyCodes = ['', '   ', null as any, undefined as any];

        emptyCodes.forEach(code => {
            const result = validateOTPCode(code);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Verification code is required');
        });
    });
});

describe('Security Utils', () => {
    test('generates secure codes consistently', () => {
        const code1 = generateSecureCode();
        const code2 = generateSecureCode();

        expect(code1).toMatch(/^\d{6}$/);
        expect(code2).toMatch(/^\d{6}$/);
        expect(code1).not.toBe(code2); // Should be different each time
    });

    test('hashes emails consistently', () => {
        const email = 'test@example.com';
        const hash1 = hashEmail(email);
        const hash2 = hashEmail(email);

        expect(hash1).toBe(hash2); // Same email should produce same hash
        expect(hash1).toBeTruthy();
        expect(typeof hash1).toBe('string');
    });

    test('produces different hashes for different emails', () => {
        const email1 = 'test1@example.com';
        const email2 = 'test2@example.com';

        const hash1 = hashEmail(email1);
        const hash2 = hashEmail(email2);

        expect(hash1).not.toBe(hash2);
    });

    test('validates token formats correctly', () => {
        const validTokens = [
            'valid.token.here',
            'demo_token_abc123_1234567890',
            'JWT.token.signature',
        ];

        const invalidTokens = [
            'short',
            '',
            'token with spaces',
            'token@invalid',
        ];

        validTokens.forEach(token => {
            expect(validateTokenFormat(token)).toBe(true);
        });

        invalidTokens.forEach(token => {
            expect(validateTokenFormat(token)).toBe(false);
        });
    });

    test('checks token expiration correctly', () => {
        const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
        const pastDate = new Date(Date.now() - 3600000); // 1 hour ago

        const validToken: AuthToken = {
            token: 'valid-token',
            expiresAt: futureDate,
        };

        const expiredToken: AuthToken = {
            token: 'expired-token',
            expiresAt: pastDate,
        };

        expect(checkTokenExpiration(validToken)).toBe(true);
        expect(checkTokenExpiration(expiredToken)).toBe(false);
    });
});

describe('Email Utilities', () => {
    test('normalizes email correctly', () => {
        const testCases = [
            { input: 'Test@Example.COM', expected: 'test@example.com' },
            { input: '  user@domain.com  ', expected: 'user@domain.com' },
            { input: 'User.Name@Domain.CO.UK', expected: 'user.name@domain.co.uk' },
        ];

        testCases.forEach(({ input, expected }) => {
            expect(normalizeEmail(input)).toBe(expected);
        });
    });

    test('generates demo tokens with correct format', () => {
        const email = 'test@example.com';
        const token = generateDemoToken(email);

        expect(token.token).toMatch(/^demo_token_/);
        expect(token.expiresAt).toBeInstanceOf(Date);
        expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
        expect(token.refreshToken).toMatch(/^refresh_/);
    });

    test('formats display email correctly', () => {
        const email = 'testuser@example.com';

        // Without masking
        expect(formatDisplayEmail(email, false)).toBe(email);

        // With masking
        const masked = formatDisplayEmail(email, true);
        expect(masked).toMatch(/^t.*r@.*\.com$/);
        expect(masked).not.toBe(email);
    });

    test('handles empty email in format display', () => {
        expect(formatDisplayEmail('')).toBe('');
        expect(formatDisplayEmail('', true)).toBe('');
    });
});

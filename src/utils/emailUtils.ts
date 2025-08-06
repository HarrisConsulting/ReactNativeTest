/**
 * Email normalization utilities to prevent case sensitivity footguns
 */

export const normalizeEmail = (email: string): string => {
    return email.toLowerCase().trim();
};

/**
 * Validate email format with additional security checks
 */
export const validateEmailFormat = (email: string): { isValid: boolean; error?: string } => {
    const normalizedEmail = normalizeEmail(email);

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
        return { isValid: false, error: 'Email address is required' };
    }

    if (!emailRegex.test(normalizedEmail)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Additional security checks
    if (normalizedEmail.length > 254) {
        return { isValid: false, error: 'Email address is too long' };
    }

    // Check for suspicious patterns
    if (normalizedEmail.includes('..')) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
};

/**
 * Compare emails safely (case-insensitive)
 */
export const emailsMatch = (email1: string, email2: string): boolean => {
    return normalizeEmail(email1) === normalizeEmail(email2);
};

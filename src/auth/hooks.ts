// Authentication hooks for ReactNativeTest
// Custom hooks for auth functionality and state management

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { validateEmail, validateOTPCode } from './utils';
import { ValidationResult } from './types';

// Main authentication hook (re-export for convenience)
export { useAuth } from './AuthContext';

// Email validation hook with real-time validation
export const useEmailValidation = (email: string): ValidationResult & { isDirty: boolean } => {
    const [isDirty, setIsDirty] = useState(false);
    const [validation, setValidation] = useState<ValidationResult>({ isValid: false });

    useEffect(() => {
        if (email.length > 0) {
            setIsDirty(true);
        }

        const result = validateEmail(email);
        setValidation(result);
    }, [email]);

    return {
        ...validation,
        isDirty,
    };
};

// OTP code validation hook
export const useOTPValidation = (code: string): ValidationResult & { isDirty: boolean } => {
    const [isDirty, setIsDirty] = useState(false);
    const [validation, setValidation] = useState<ValidationResult>({ isValid: false });

    useEffect(() => {
        if (code.length > 0) {
            setIsDirty(true);
        }

        const result = validateOTPCode(code);
        setValidation(result);
    }, [code]);

    return {
        ...validation,
        isDirty,
    };
};

// Authentication flow controls hook
export const useAuthFlow = () => {
    const { login, verify, isLoading, error, pendingEmail } = useAuth();
    const [retryCount, setRetryCount] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);

    // Rate limiting for login attempts
    const canAttemptLogin = useCallback((): boolean => {
        if (retryCount === 0) return true;

        const now = Date.now();
        const cooldownPeriod = Math.min(retryCount * 5000, 30000); // Max 30 seconds

        return !lastAttemptTime || (now - lastAttemptTime) > cooldownPeriod;
    }, [retryCount, lastAttemptTime]);

    const attemptLogin = useCallback(async (email: string) => {
        if (!canAttemptLogin()) {
            throw new Error('Please wait before trying again');
        }

        setLastAttemptTime(Date.now());
        const result = await login(email);

        if (!result.success) {
            setRetryCount(prev => prev + 1);
        } else {
            setRetryCount(0); // Reset on success
        }

        return result;
    }, [login, canAttemptLogin]);

    const attemptVerification = useCallback(async (email: string, code: string) => {
        const result = await verify(email, code);

        if (result.success) {
            setRetryCount(0); // Reset on successful verification
        }

        return result;
    }, [verify]);

    const getCooldownTime = useCallback((): number => {
        if (retryCount === 0 || !lastAttemptTime) return 0;

        const now = Date.now();
        const cooldownPeriod = Math.min(retryCount * 5000, 30000);
        const elapsed = now - lastAttemptTime;

        return Math.max(0, cooldownPeriod - elapsed);
    }, [retryCount, lastAttemptTime]);

    return {
        attemptLogin,
        attemptVerification,
        canAttemptLogin: canAttemptLogin(),
        cooldownTime: getCooldownTime(),
        retryCount,
        isLoading,
        error,
        pendingEmail,
    };
};

// Countdown timer hook (useful for resend functionality)
export const useCountdown = (initialSeconds: number = 60) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const start = useCallback((customSeconds?: number) => {
        setSeconds(customSeconds ?? initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const stop = useCallback(() => {
        setIsActive(false);
        setSeconds(0);
    }, []);

    const reset = useCallback(() => {
        setSeconds(initialSeconds);
        setIsActive(false);
    }, [initialSeconds]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(currentSeconds => currentSeconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    return {
        seconds,
        isActive,
        start,
        stop,
        reset,
        isFinished: seconds === 0 && !isActive,
    };
};

// Protected route hook
export const useProtectedAction = () => {
    const { isAuthenticated } = useAuth();

    const executeProtectedAction = useCallback((
        action: () => void,
        onAuthRequired: () => void
    ) => {
        if (isAuthenticated) {
            action();
        } else {
            onAuthRequired();
        }
    }, [isAuthenticated]);

    return {
        isAuthenticated,
        executeProtectedAction,
    };
};

// Authentication status hook with detailed states
export const useAuthStatus = () => {
    const { isAuthenticated, user, isLoading, error } = useAuth();

    const status = (() => {
        if (isLoading) return 'loading';
        if (error) return 'error';
        if (isAuthenticated && user) return 'authenticated';
        return 'unauthenticated';
    })();

    return {
        status,
        isAuthenticated,
        isLoading,
        isError: !!error,
        user,
        error,
    };
};

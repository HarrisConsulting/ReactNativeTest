/**
 * Rate limiting hooks to prevent abuse and Supabase rate limit footguns
 */
import { useState } from 'react';

export interface RateLimitConfig {
    key: string;
    limitMs: number;
    maxAttempts?: number;
}

export const useRateLimit = (key: string, limitMs: number = 60000) => {
    const [lastRequest, setLastRequest] = useState<number>(0);
    const [attempts, setAttempts] = useState<number>(0);

    const canMakeRequest = (): boolean => {
        const now = Date.now();
        return now - lastRequest > limitMs;
    };

    const getRemainingTime = (): number => {
        const now = Date.now();
        const remaining = limitMs - (now - lastRequest);
        return Math.max(0, remaining);
    };

    const makeRequest = (): boolean => {
        if (!canMakeRequest()) {
            return false;
        }

        setLastRequest(Date.now());
        setAttempts(prev => prev + 1);
        return true;
    };

    const reset = (): void => {
        setLastRequest(0);
        setAttempts(0);
    };

    return {
        canMakeRequest,
        makeRequest,
        getRemainingTime,
        attempts,
        reset
    };
};

/**
 * Global rate limiting storage for persistent rate limits across app restarts
 */
class RateLimitStore {
    private storage = new Map<string, { timestamp: number; attempts: number }>();

    canMakeRequest(key: string, limitMs: number): boolean {
        const stored = this.storage.get(key);
        if (!stored) return true;

        const now = Date.now();
        return now - stored.timestamp > limitMs;
    }

    recordRequest(key: string): void {
        const stored = this.storage.get(key);
        this.storage.set(key, {
            timestamp: Date.now(),
            attempts: stored ? stored.attempts + 1 : 1
        });
    }

    getRemainingTime(key: string, limitMs: number): number {
        const stored = this.storage.get(key);
        if (!stored) return 0;

        const now = Date.now();
        const remaining = limitMs - (now - stored.timestamp);
        return Math.max(0, remaining);
    }

    getAttempts(key: string): number {
        const stored = this.storage.get(key);
        return stored ? stored.attempts : 0;
    }

    clear(key: string): void {
        this.storage.delete(key);
    }
}

export const rateLimitStore = new RateLimitStore();

/**
 * Higher-order function to add rate limiting to any async function
 */
export const withRateLimit = <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    key: string,
    limitMs: number = 60000
) => {
    return async (...args: T): Promise<R> => {
        if (!rateLimitStore.canMakeRequest(key, limitMs)) {
            const remainingMs = rateLimitStore.getRemainingTime(key, limitMs);
            const remainingSec = Math.ceil(remainingMs / 1000);
            throw new Error(`Please wait ${remainingSec} seconds before trying again.`);
        }

        rateLimitStore.recordRequest(key);
        return fn(...args);
    };
};

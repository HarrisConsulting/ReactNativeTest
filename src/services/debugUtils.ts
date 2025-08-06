/**
 * Debug utilities for production authentication troubleshooting
 */
import { environment } from '../services/environment';

export interface AuthDebugData {
    [key: string]: any;
}

export const logAuthDebug = (step: string, data: AuthDebugData): void => {
    if (__DEV__ || environment.APP_ENV === 'development') {
        console.log(`🔐 AUTH DEBUG [${step}]:`, data);
    }

    // In production, you might want to send to a logging service
    // if (environment.APP_ENV === 'production' && environment.ENABLE_DEBUG_LOGS) {
    //   sendToLoggingService({ step, data, timestamp: new Date().toISOString() });
    // }
};

export const logAuthError = (step: string, error: any, context?: AuthDebugData): void => {
    const errorData = {
        step,
        error: error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
        } : error,
        context,
        timestamp: new Date().toISOString(),
        environment: environment.APP_ENV
    };

    console.error('🚨 AUTH ERROR:', errorData);

    // In production, always log errors to monitoring service
    // if (environment.APP_ENV === 'production') {
    //   sendToErrorMonitoring(errorData);
    // }
};

export const logNetworkRequest = (url: string, method: string, success: boolean, duration?: number): void => {
    if (__DEV__) {
        const status = success ? '✅' : '❌';
        console.log(`${status} NETWORK [${method}] ${url}${duration ? ` (${duration}ms)` : ''}`);
    }
};

/**
 * Performance timing utilities for auth flows
 */
export class AuthPerformanceTracker {
    private startTimes = new Map<string, number>();

    start(operation: string): void {
        this.startTimes.set(operation, Date.now());
        logAuthDebug('performance-start', { operation });
    }

    end(operation: string): number {
        const startTime = this.startTimes.get(operation);
        if (!startTime) {
            logAuthError('performance-end', 'No start time recorded', { operation });
            return 0;
        }

        const duration = Date.now() - startTime;
        this.startTimes.delete(operation);

        logAuthDebug('performance-end', { operation, duration });

        // Log slow operations
        if (duration > 5000) {
            logAuthError('slow-operation', `${operation} took ${duration}ms`, { operation, duration });
        }

        return duration;
    }
}

export const authPerformanceTracker = new AuthPerformanceTracker();

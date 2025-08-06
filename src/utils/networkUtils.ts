/**
 * Network utilities to handle connectivity issues and prevent network footguns
 */

export interface NetworkStatus {
    isConnected: boolean;
    hasInternet: boolean;
    connectionType: string;
}

// Simple network check using fetch to a reliable endpoint
export const checkConnectivity = async (): Promise<NetworkStatus> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return {
            isConnected: true,
            hasInternet: true,
            connectionType: 'unknown'
        };
    } catch (error) {
        return {
            isConnected: false,
            hasInternet: false,
            connectionType: 'unknown'
        };
    }
};

export const isNetworkAvailable = async (): Promise<boolean> => {
    const status = await checkConnectivity();
    return status.isConnected && status.hasInternet;
};

/**
 * Network-aware fetch wrapper with timeout and retry logic
 */
export const networkFetch = async (
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000,
    retries: number = 2
): Promise<Response> => {
    // Check network first
    const hasNetwork = await isNetworkAvailable();
    if (!hasNetwork) {
        throw new Error('No internet connection. Please check your network and try again.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorName = error instanceof Error ? error.name : '';

        if (errorName === 'AbortError' && retries > 0) {
            console.log(`Request timeout, retrying... (${retries} retries left)`);
            return networkFetch(url, options, timeoutMs, retries - 1);
        }

        if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
            throw new Error('Network connection failed. Please check your internet and try again.');
        }

        throw error;
    }
};

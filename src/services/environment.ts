// Environment validation to prevent critical footguns
import Config from 'react-native-config';

export interface Environment {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    APP_ENV: string;
    APP_VERSION: string;
}

export const environment: Environment = {
    SUPABASE_URL: Config.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY || '',
    APP_ENV: Config.APP_ENV || 'development',
    APP_VERSION: Config.APP_VERSION || '1.0.0',
};

export const validateEnvironment = (): string[] => {
    const errors: string[] = [];

    // Check for placeholder values
    if (environment.SUPABASE_URL === 'your_supabase_project_url_here') {
        errors.push('❌ SUPABASE_URL still contains placeholder value!');
    }

    if (environment.SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
        errors.push('❌ SUPABASE_ANON_KEY still contains placeholder value!');
    }

    // Check for localhost in production
    if (environment.SUPABASE_URL.includes('localhost') && environment.APP_ENV === 'production') {
        errors.push('❌ Using localhost Supabase URL in production!');
    }

    // Validate Supabase anon key format
    if (!environment.SUPABASE_ANON_KEY.startsWith('eyJ')) {
        errors.push('❌ Invalid Supabase anon key format (should start with "eyJ")');
    }

    // Check for missing values
    if (!environment.SUPABASE_URL) {
        errors.push('❌ SUPABASE_URL is not set');
    }

    if (!environment.SUPABASE_ANON_KEY) {
        errors.push('❌ SUPABASE_ANON_KEY is not set');
    }

    return errors;
};

// Validate on import to catch issues early
const envErrors = validateEnvironment();
if (envErrors.length > 0) {
    console.error('🚨 Environment Configuration Errors:');
    envErrors.forEach(error => console.error(error));

    if (environment.APP_ENV === 'production') {
        throw new Error('❌ Environment validation failed in production');
    }
}

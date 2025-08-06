import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment, validateEnvironment } from './environment';
import { logAuthDebug, logAuthError } from './debugUtils';

// Validate environment on import
const envErrors = validateEnvironment();
if (envErrors.length > 0) {
    logAuthError('environment-validation', 'Environment validation failed', { errors: envErrors });
    if (environment.APP_ENV === 'production') {
        throw new Error(`❌ Critical environment validation failed: ${envErrors.join(', ')}`);
    }
}

logAuthDebug('supabase-init', {
    hasUrl: !!environment.SUPABASE_URL,
    hasKey: !!environment.SUPABASE_ANON_KEY,
    environment: environment.APP_ENV
});

// Create Supabase client
export const supabase: SupabaseClient = createClient(
    environment.SUPABASE_URL,
    environment.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true, // Enable for magic link handling
        },
        global: {
            headers: {
                'X-Client-Info': 'ReactNativeTest-react-native',
                'X-App-Version': '1.0.0',
                'X-App-Environment': 'development',
            },
        },
    },
);

console.log('✅ Supabase client created successfully');
console.log('  Client type:', typeof supabase);
console.log('  Client has auth:', !!supabase.auth);
console.log('  Client has from:', !!supabase.from);

// Log connection status and auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event, session?.user?.email);
});

export type { SupabaseClient };

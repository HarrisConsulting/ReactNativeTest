These footguns are the most common causes of magic link authentication failures. Addressing them proactively will save you significant debugging time in production!

## **🔫 Critical Footguns & Solutions**

### **1. Email Client Deep Link Blocking**

**Problem:** Different email clients handle deep links differently, especially mobile clients.

```typescript
// ❌ FOOTGUN: Only relying on Universal Links
const MOBILE_EMAIL_BEHAVIORS = {
  'iOS Gmail App': 'Opens in webview, blocks deep links',
  'iOS Outlook App': 'Security blocks custom schemes', 
  'Android Gmail': 'Shows "Open with..." dialog',
  'Apple Mail': 'Works natively ✅'
};
```

**✅ Solution:** Multi-layer fallback strategy
```typescript
// src/auth/magicLinkConfig.ts
export const getMagicLinkConfig = () => ({
  // Primary: Universal Link
  redirectTo: 'https://send.montessoricenter.org/auth/callback',
  
  // Fallback: Custom scheme  
  fallbackUrl: 'myapp://auth/callback',
  
  // Web fallback with app launch button
  webFallback: 'https://send.montessoricenter.org/email-confirmed.html'
});
```

### **2. Environment Variable Misconfiguration**

**Problem:** Wrong Supabase URLs/keys between environments cause silent failures.

```typescript
// ❌ FOOTGUN: Using wrong environment in production
SUPABASE_URL=http://localhost:54321  // Local URL in production!
SUPABASE_ANON_KEY=local-dev-key      // Wrong key!
```

**✅ Solution:** Environment validation
```typescript
// src/services/environment.ts
export const validateEnvironment = (): string[] => {
  const errors: string[] = [];
  
  if (environment.SUPABASE_URL.includes('localhost') && environment.APP_ENV === 'production') {
    errors.push('❌ Using localhost Supabase URL in production!');
  }
  
  if (!environment.SUPABASE_ANON_KEY.startsWith('eyJ')) {
    errors.push('❌ Invalid Supabase anon key format');
  }
  
  return errors;
};
```

### **3. Whitelist Function Not Callable**

**Problem:** RLS policies or function permissions prevent whitelist checking.

```sql
-- ❌ FOOTGUN: Function not accessible to anon users
CREATE OR REPLACE FUNCTION check_whitelist(email_input TEXT)
RETURNS BOOLEAN AS $$
-- Missing SECURITY DEFINER and proper grants!
```

**✅ Solution:** Proper function security
```sql
-- Correct implementation
CREATE OR REPLACE FUNCTION check_whitelist(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_whitelist 
    WHERE email = LOWER(TRIM(email_input))  -- Normalize email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to anon users
GRANT EXECUTE ON FUNCTION check_whitelist(TEXT) TO anon;
```

### **4. Case Sensitivity & Email Normalization**

**Problem:** Email case mismatches cause whitelist failures.

```typescript
// ❌ FOOTGUN: Case sensitivity
Whitelist: "john@example.com"
User enters: "John@Example.COM" 
Result: ❌ Not found!
```

**✅ Solution:** Consistent normalization
```typescript
// src/utils/emailUtils.ts
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// In your auth hook
const signInWithMagicLink = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  // Use normalized email for all operations
};
```

### **5. Supabase Edge Function Timeout**

**Problem:** Edge Functions have execution limits and can timeout.

```typescript
// ❌ FOOTGUN: No timeout handling
const response = await fetch('/functions/v1/inviteUser', {
  // No timeout - can hang indefinitely
});
```

**✅ Solution:** Proper timeout and retry logic
```typescript
// src/services/auth.ts
const callEdgeFunction = async (email: string, retries = 3) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(
      `${environment.SUPABASE_URL}/functions/v1/inviteUser`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${environment.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email: normalizeEmail(email) }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError' && retries > 0) {
      return callEdgeFunction(email, retries - 1); // Retry
    }
    throw error;
  }
};
```

### **6. Magic Link Expiration & Multiple Requests**

**Problem:** Users click expired links or request multiple magic links.

```typescript
// ❌ FOOTGUN: No expiration handling
// User clicks 30-minute old link -> Silent failure
```

**✅ Solution:** Handle expiration gracefully
```typescript
// src/auth/deepLinkHandler.ts
export const handleMagicLink = async (url: string) => {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
    
    if (error) {
      // Handle specific error types
      if (error.message.includes('expired')) {
        return { 
          success: false, 
          error: 'expired',
          message: 'This link has expired. Please request a new one.' 
        };
      }
      
      if (error.message.includes('already_used')) {
        return { 
          success: false, 
          error: 'used',
          message: 'This link has already been used. Please request a new one.' 
        };
      }
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'network' };
  }
};
```

### **7. iOS Universal Link Configuration**

**Problem:** Universal Links not properly configured in iOS.

```json
// ❌ FOOTGUN: Missing or incorrect apple-app-site-association
// File not accessible at https://yourdomain.com/.well-known/apple-app-site-association
```

**✅ Solution:** Proper Universal Link setup
```json
// .well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.MontessoriCenterApp",
        "paths": ["/auth/callback", "/email-confirmed"]
      }
    ]
  }
}
```

### **8. Network Connectivity Issues**

**Problem:** No network or poor connectivity during authentication.

```typescript
// ❌ FOOTGUN: No connectivity check
// User has no internet -> cryptic error messages
```

**✅ Solution:** Network-aware error handling
```typescript
// src/utils/networkUtils.ts
import NetInfo from '@react-native-community/netinfo';

export const checkConnectivity = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

// In your auth flow
const signInWithMagicLink = async (email: string) => {
  const isConnected = await checkConnectivity();
  
  if (!isConnected) {
    return { 
      success: false, 
      error: 'Please check your internet connection and try again.' 
    };
  }
  
  // Continue with auth...
};
```

### **9. Rate Limiting & Abuse Prevention**

**Problem:** Too many magic link requests trigger rate limits.

```typescript
// ❌ FOOTGUN: No rate limiting awareness
// User clicks "Send" repeatedly -> Supabase blocks requests
```

**✅ Solution:** Client-side rate limiting
```typescript
// src/hooks/useRateLimit.ts
export const useRateLimit = (key: string, limitMs: number = 60000) => {
  const [lastRequest, setLastRequest] = useState<number>(0);
  
  const canMakeRequest = () => {
    const now = Date.now();
    return now - lastRequest > limitMs;
  };
  
  const makeRequest = () => {
    setLastRequest(Date.now());
  };
  
  return { canMakeRequest, makeRequest };
};

// In your component
const { canMakeRequest, makeRequest } = useRateLimit('magic-link', 60000);

const handleSubmit = async () => {
  if (!canMakeRequest()) {
    Alert.alert('Please wait', 'You can request a new magic link in 1 minute.');
    return;
  }
  
  makeRequest();
  // Proceed with magic link request...
};
```

### **10. Debug Detection Issues**

**Problem:** Authentication works in development but fails in production.

```typescript
// ❌ FOOTGUN: Different behavior in release builds
// React Native Config not loading in production
// Deep links not registered in release scheme
```

**✅ Solution:** Production debugging tools
```typescript
// src/services/debugUtils.ts
export const logAuthDebug = (step: string, data: any) => {
  if (__DEV__ || environment.ENABLE_DEBUG_LOGS) {
    console.log(`🔐 AUTH DEBUG [${step}]:`, data);
  }
};

// Usage throughout auth flow
logAuthDebug('whitelist-check', { email, isWhitelisted });
logAuthDebug('magic-link-sent', { success, error });
logAuthDebug('deep-link-received', { url, tokens });
```

## **🛡️ Comprehensive Testing Strategy**

Based on your `8.0testing-strategy.md`, test these footguns:

```typescript
// src/__tests__/auth/magicLinkFlow.test.ts
describe('Magic Link Footgun Prevention', () => {
  test('handles case-insensitive email validation', async () => {
    // Test both "user@EXAMPLE.com" and "USER@example.com"
  });

  test('gracefully handles network timeouts', async () => {
    // Mock network timeout and verify error handling
  });

  test('prevents rapid consecutive requests', async () => {
    // Test rate limiting
  });

  test('handles expired magic links', async () => {
    // Test expired token scenarios
  });
});
```

## **📋 Pre-Deployment Footgun Checklist**

From your `7.0dont-forget-checklist.md`:

- [ ] **Environment variables validated** for each environment
- [ ] **Universal Links tested** on physical iOS device
- [ ] **Email whitelist function** accessible to anon users  
- [ ] **Fallback web page** deployed and accessible
- [ ] **Rate limiting** implemented and tested
- [ ] **Network error handling** implemented
- [ ] **Magic link expiration** handled gracefully
- [ ] **Case normalization** applied consistently
- [ ] **Edge Function timeout** configured
- [ ] **Debug logging** available for production issues


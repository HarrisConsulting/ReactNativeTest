# ReactNativeTest Authentication User Journey
**Created:** August 6, 2025, 2:06 PM  
**Status:** Expected Flow Documentation  
**Context:** User email is pre-whitelisted in Supabase `email_whitelist` table

## Prerequisites
1. ✅ User's email has been manually added to Supabase `email_whitelist` table with `status = 'active'`
2. ✅ User has installed ReactNativeTest app on their device
3. ✅ Device has network connectivity
4. ✅ Deep link URL scheme `reactnativetest://` is properly configured in iOS Info.plist

## Complete User Journey Flow

### Phase 1: App Launch & Navigation
```
📱 User opens ReactNativeTest app
  ↓
🔄 AuthContext initializes and checks for existing session
  ↓ (No existing session)
🏠 User lands on Home tab with tab navigator visible
  ↓
🔐 User taps "Auth" tab to access authentication features
```

### Phase 2: Email Entry & Validation
```
📧 LoginScreen displays with email input field
  ↓
⌨️  User enters their whitelisted email address (e.g., "user@example.com")
  ↓
✅ Client-side email format validation passes
  ↓
🎯 User taps "Send Verification Email" button
  ↓
🔄 Loading state activates (spinner shown, button disabled)
```

### Phase 3: Server-Side Processing
```
🌐 SupabaseAuthService.sendLoginEmail() called with rate limiting
  ↓
📡 Network connectivity check passes
  ↓
📧 Email format validation (client-side) passes
  ↓
🔍 Email normalization: "user@example.com" → "user@example.com"
  ↓
🛡️  Whitelist check: Query Supabase email_whitelist table
    SELECT email FROM email_whitelist 
    WHERE email = 'user@example.com' 
    AND status = 'active'
  ↓ ✅ Email found in whitelist
🔗 Supabase Auth API called:
    supabase.auth.signInWithOtp({
      email: "user@example.com",
      options: {
        emailRedirectTo: "reactnativetest://auth/callback"
      }
    })
  ↓ ✅ Magic link email queued for delivery
📧 Response: { success: true, message: "Verification email sent to user@example.com" }
```

### Phase 4: User Feedback & Navigation
```
✅ LoginScreen receives success response
  ↓
📱 Alert popup shows: "Email Sent - We've sent a verification code to user@example.com..."
  ↓
👆 User taps "OK" on alert
  ↓
🔀 Navigation: LoginScreen → VerificationScreen
    Params: { email: "user@example.com", returnTo: undefined }
  ↓
⏱️  60-second resend countdown starts
  ↓
📱 VerificationScreen displays with:
    - "Enter the 6-digit code sent to user@example.com"
    - Code input field (6 digits)
    - "Resend Code" button (disabled for 60s)
    - "Or tap the magic link in your email"
```

### Phase 5A: Magic Link Path (Primary)
```
📧 User receives email from Supabase with magic link
  ↓
👆 User taps magic link in email
  ↓
🔗 Device opens URL: "reactnativetest://auth/callback?access_token=xxx&refresh_token=xxx&..."
  ↓
📱 iOS recognizes URL scheme and opens ReactNativeTest app
  ↓
🔄 Deep link handler in VerificationScreen triggered
  ↓
🔐 SupabaseAuthService.handleMagicLink(url) called
    - Extracts access_token and refresh_token from URL
    - Calls supabase.auth.setSession({ access_token, refresh_token })
    - Creates user profile if needed
  ↓ ✅ Authentication successful
👤 User object created:
    {
      id: "supabase-user-uuid",
      email: "user@example.com", 
      isVerified: true,
      createdAt: Date,
      lastLoginAt: Date
    }
  ↓
🎉 Alert: "Welcome! You have been successfully authenticated via magic link."
  ↓
👆 User taps "Continue"
  ↓
🔀 Navigation: VerificationScreen → ProfileScreen (default destination)
```

### Phase 5B: Manual Code Entry Path (Alternative)
```
📧 User receives email with 6-digit verification code
  ↓
⌨️  User manually types 6-digit code (e.g., "123456")
  ↓
✅ Client-side code format validation passes (6 digits, numeric)
  ↓
👆 User taps "Verify Code" button
  ↓
🔄 Loading state activates
  ↓
🔐 SupabaseAuthService.verifyCode("user@example.com", "123456") called
    - Calls supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    - Creates user profile if needed
  ↓ ✅ Verification successful
👤 User object created (same as magic link path)
  ↓
🔀 Navigation: VerificationScreen → ProfileScreen
```

### Phase 6: Authenticated State
```
🔄 AuthContext state updates:
    {
      isAuthenticated: true,
      user: { id, email, isVerified: true, ... },
      isLoading: false,
      error: null,
      pendingEmail: null
    }
  ↓
🔀 Navigation stack updates to show authenticated screens:
    - AuthStackNavigator switches to authenticated flow
    - Profile and Game screens become available
  ↓
👤 ProfileScreen displays user information:
    - Welcome message with email
    - Last login timestamp
    - Sign out option
  ↓
🎮 User can now access GameScreen (protected content)
  ↓
💾 Session automatically persists via Supabase client
```

### Phase 7: Session Persistence
```
📱 User closes app
  ↓
💾 Supabase session stored in device secure storage
  ↓
📱 User reopens app later
  ↓
🔄 AuthContext.checkExistingSession() called on mount
    - SupabaseAuthService.getCurrentSession() checks stored session
    - If valid, user automatically signed in
    - If expired/invalid, user returns to LoginScreen
  ↓
✅ User lands directly on ProfileScreen (if session valid)
```

## Error Handling Paths

### Email Not Whitelisted
```
📧 User enters non-whitelisted email
  ↓
🛡️  Whitelist check fails
  ↓
❌ Response: { success: false, message: "Email address is not authorized for access." }
  ↓
🚨 Alert shown to user with error message
  ↓
📧 User remains on LoginScreen to try different email
```

### Expired Magic Link
```
🔗 User taps old magic link (>10 minutes old)
  ↓
❌ Supabase returns error: "expired" 
  ↓
🚨 Alert: "This magic link has expired. Please request a new one."
  ↓
🔀 User can request new magic link or enter code manually
```

### Invalid Verification Code
```
⌨️  User enters wrong 6-digit code
  ↓
❌ Supabase OTP verification fails
  ↓
🚨 Error message: "Invalid verification code. Please try again."
  ↓
🔄 User can retry with correct code
```

### Network Connectivity Issues
```
📡 No internet connection detected
  ↓
❌ Response: { success: false, message: "No internet connection. Please check your network and try again." }
  ↓
🚨 Alert shown to user
  ↓
🔄 User can retry when connectivity restored
```

## Key Technical Implementation Details

### Deep Link Configuration
- **URL Scheme:** `reactnativetest://`
- **Auth Callback:** `reactnativetest://auth/callback`
- **iOS Info.plist:** CFBundleURLSchemes configured
- **Handler:** VerificationScreen useEffect with Linking API

### Rate Limiting
- **Magic Link Requests:** 1 per minute per IP/email
- **Implementation:** `withRateLimit` decorator on `sendLoginEmail`
- **User Feedback:** 60-second countdown on resend button

### Session Management
- **Provider:** Supabase Auth with automatic token refresh
- **Storage:** Secure device storage via Supabase client
- **Context:** React Context (AuthProvider) for global state
- **Persistence:** Automatic across app restarts

### Security Features
- **Email Whitelist:** Server-side validation against Supabase table
- **Token Expiry:** Magic links expire after 10 minutes
- **One-time Use:** Magic links and OTP codes are single-use
- **Secure Storage:** Tokens stored in device keychain/keystore

## Success Criteria
✅ User can authenticate using either magic link OR manual code entry  
✅ Session persists across app restarts  
✅ Protected screens (Profile, Game) accessible only when authenticated  
✅ Clean error handling for all failure scenarios  
✅ Rate limiting prevents abuse  
✅ Deep links work seamlessly on iOS  

# Supabase OTP Configuration Guide

## Problem
Your ReactNativeTest app UI is designed for 6-digit OTP codes, but Supabase was sending magic links instead. This causes a mismatch between the expected user experience and the actual email content.

## Solution: Configure Supabase for OTP Codes Only

### Step 1: Update Supabase Dashboard Settings

1. **Go to your Supabase project dashboard**
   - Navigate to: `Authentication` → `Settings` → `Auth`

2. **Configure Email Template**
   - In the "Email Templates" section
   - Select "Magic Link" template
   - **Change the template** to send OTP codes instead:

```html
<h2>Your verification code</h2>
<p>Enter this code in the app to verify your email:</p>
<p style="font-size: 32px; font-weight: bold; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px;">{{ .Token }}</p>
<p>This code will expire in 60 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
```

3. **Disable Magic Link Redirects**
   - In "Auth Settings" section
   - Set `Site URL` to your app's domain (not a deep link)
   - Ensure `Additional Redirect URLs` doesn't include deep link schemes

### Step 2: Update Email Subject Line

Change the email subject to:
```
Your verification code for ReactNativeTest
```

### Step 3: Verify OTP Settings

In your Supabase dashboard:
- Go to `Authentication` → `Settings` → `Auth`
- Ensure `Enable email confirmations` is **enabled**
- Ensure `Secure email change` is **enabled**  
- Set `Email OTP expiry` to `3600` (60 minutes)

### Step 4: Test the Configuration

1. **Code Changes Applied**: ✅
   - Removed `emailRedirectTo` parameter
   - Added `shouldCreateUser: false` for security

2. **Test Email Flow**:
   ```bash
   # Run the app
   npm run ios
   
   # Test with whitelisted email
   # Enter: rogerjharris@yahoo.com
   # Verify: Email now contains 6-digit code instead of magic link
   ```

## Expected User Experience After Fix

1. **User enters email** → App validates and sends to Supabase
2. **Supabase sends email** → Contains 6-digit OTP code (no magic link)
3. **User enters code** → App verifies with Supabase
4. **Authentication complete** → User accesses protected content

## Code Changes Made

### Before (Magic Link):
```typescript
const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
        emailRedirectTo: 'reactnativetest://auth/callback', // Magic link
    },
});
```

### After (OTP Code):
```typescript
const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
        shouldCreateUser: false, // Only allow existing users
        // No emailRedirectTo = OTP codes instead of magic links
    },
});
```

## Verification Checklist

- [ ] Supabase dashboard email template updated
- [ ] Email subject line changed
- [ ] Magic link redirects disabled
- [ ] OTP expiry time set appropriately
- [ ] Code changes applied and tested
- [ ] Email now contains 6-digit code
- [ ] App successfully verifies codes
- [ ] No magic links in emails

## Benefits of This Approach

✅ **Better Mobile UX**: No app switching required  
✅ **Reliable**: No deep link configuration complexity  
✅ **Secure**: Codes expire automatically  
✅ **Simple**: User stays in your app throughout flow  
✅ **Testable**: Easy to test and debug  

## Troubleshooting

If you still see magic links:
1. Clear Supabase email template cache (wait 5-10 minutes)
2. Check that email template was saved correctly
3. Verify no other email templates are overriding
4. Test with a different email address

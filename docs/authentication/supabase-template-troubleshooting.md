# Supabase OTP Email Template Troubleshooting Guide

## 🚨 **Issue**: Template Updated But Still Receiving Magic Links

**Problem**: You've updated the Supabase email template to show OTP codes, but emails still contain magic links instead of 6-digit codes.

## 🔍 **Root Cause Analysis**

### **Most Common Issues:**

1. **Wrong Template Type Selected**
   - Supabase has multiple email templates
   - OTP codes use "Confirm signup" template, NOT "Magic Link" template

2. **Template Cache Not Cleared**
   - Supabase caches email templates for 5-10 minutes
   - Changes don't take effect immediately

3. **Wrong Supabase Configuration**
   - Need to ensure OTP is enabled in Auth settings
   - Magic link settings may override OTP settings

## ✅ **Step-by-Step Fix**

### **Step 1: Verify Correct Template**
In your Supabase dashboard:
1. Go to `Authentication` → `Settings` → `Email Templates`
2. Select **"Confirm signup"** template (NOT "Magic Link")
3. Ensure this template contains your OTP code HTML:

```html
<h2>Your verification code</h2>
<p>Enter this code in the ReactNativeTest app:</p>
<p style="font-size: 32px; font-weight: bold; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px;">{{ .Token }}</p>
<p>This code will expire in 60 minutes.</p>
```

### **Step 2: Check Auth Settings**
1. Go to `Authentication` → `Settings` → `Auth`
2. Ensure these settings:
   - ✅ **Enable email confirmations**: ON
   - ✅ **Secure email change**: ON  
   - ✅ **Email OTP expiry**: 3600 (60 minutes)

### **Step 3: Disable Magic Link Settings**
1. In Auth settings, look for:
   - **Site URL**: Should NOT be a deep link (use your domain)
   - **Additional Redirect URLs**: Remove any deep link schemes
   - Ensure no magic link overrides are enabled

### **Step 4: Clear Template Cache**
1. Make a small change to the template (add a space)
2. Save the template
3. Wait 5-10 minutes for cache to clear
4. Test again

### **Step 5: Test Email Type**
The issue might be that `signInWithOtp()` without `emailRedirectTo` should use the "Confirm signup" template, but it might still be using "Magic Link" template.

## 🧪 **Testing Steps**

1. **Clear Browser Cache**: Clear your browser cache for the email provider
2. **Wait 10 Minutes**: Supabase templates have a cache delay
3. **Test with Different Email**: Try a different email address
4. **Check Spam Folder**: Sometimes template changes affect spam detection

## 🔧 **Alternative Configuration**

If the template still doesn't work, try this approach:

### **Option A: Use Phone/Email OTP Template**
1. Go to `Authentication` → `Settings` → `Email Templates`
2. Look for "Email OTP" or "Phone/Email OTP" template
3. Apply your OTP code template to that one instead

### **Option B: Force OTP Mode**
Update your Supabase auth configuration to explicitly force OTP mode:

```typescript
// In supabaseAuthService.ts, try this alternative:
const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
        shouldCreateUser: false,
        emailRedirectTo: undefined, // Explicitly set to undefined
    },
});
```

## 🎯 **Expected Result**

After fixing the template configuration:
- ✅ Emails should contain 6-digit numeric codes
- ✅ No magic links in email content
- ✅ Subject line: "Your verification code for ReactNativeTest"
- ✅ Code expires in 60 minutes

## 📞 **Next Steps**

1. **Check "Confirm signup" template** (most likely fix)
2. **Wait 10 minutes** for cache to clear
3. **Test with your whitelisted email**
4. **Report back** with results

If this doesn't work, we may need to check your specific Supabase project configuration or try the alternative approaches above.

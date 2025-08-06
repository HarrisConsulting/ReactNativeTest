# 🚀 Magic Link Authentication - Production Deployment Checklist

Use this checklist before deploying to production to avoid critical magic link footguns.

## **📋 Pre-Deployment Checklist**

### **🔧 Environment Configuration**
- [ ] **Replace placeholder values in .env**
  - [ ] Set real `SUPABASE_URL` (remove `your_supabase_project_url_here`)
  - [ ] Set real `SUPABASE_ANON_KEY` (remove `your_supabase_anon_key_here`)
  - [ ] Set `APP_ENV=production`
- [ ] **Validate environment variables** by running the app once
- [ ] **Test environment validation** - app should crash if misconfigured in production

### **🔗 Deep Link Configuration**
- [ ] **iOS Deep Links**
  - [ ] Custom scheme `reactnativetest://` configured in `Info.plist` ✅
  - [ ] Test on physical iOS device (simulators may not handle deep links properly)
  - [ ] For Universal Links: Configure `apple-app-site-association` file
- [ ] **Android Deep Links**
  - [ ] Intent filter configured in `AndroidManifest.xml` ✅  
  - [ ] Test on physical Android device
- [ ] **Test magic links work** in both Gmail app and native mail apps

### **🗄️ Database Setup**
- [ ] **Email whitelist table populated** with authorized emails
- [ ] **Run database schema** from `supabase/schema.sql`
- [ ] **Test whitelist function** accessible to anon users:
  ```sql
  SELECT check_whitelist('test@example.com');
  ```
- [ ] **RLS policies** working correctly

### **📧 Email Provider Configuration**
- [ ] **Supabase Email Templates** configured
- [ ] **Custom email domain** configured (optional but recommended)
- [ ] **Email delivery testing** from Supabase dashboard
- [ ] **Spam folder testing** - ensure emails don't go to spam

### **🔒 Security & Rate Limiting**
- [ ] **Rate limiting implemented** ✅ (60 second cooldown)
- [ ] **Email normalization working** ✅ (case insensitive)
- [ ] **Network error handling** ✅
- [ ] **Magic link expiration handling** ✅
- [ ] **Invalid/used link handling** ✅

### **📱 Mobile App Configuration**
- [ ] **Bundle ID/Package Name** matches Supabase project settings
- [ ] **Deep link redirect URL** matches app configuration:
  - Supabase: `reactnativetest://auth/callback`
  - iOS: `reactnativetest` scheme configured
  - Android: `reactnativetest` scheme in intent-filter
- [ ] **App Store/Play Store** deep link validation

### **🧪 Testing Scenarios**
- [ ] **Happy path testing**
  - [ ] Enter whitelisted email → receive magic link → tap link → authenticated
- [ ] **Error scenarios**
  - [ ] Non-whitelisted email → proper error message
  - [ ] No internet → network error message
  - [ ] Expired magic link → expiration message
  - [ ] Used magic link → already used message
  - [ ] Rate limiting → cooldown message
- [ ] **Email client testing**
  - [ ] iOS Gmail app
  - [ ] iOS Apple Mail
  - [ ] Android Gmail
  - [ ] Outlook mobile app

### **🔍 Monitoring & Debug**
- [ ] **Error logging** configured for production issues
- [ ] **Performance monitoring** for slow auth operations
- [ ] **Debug logs** available but not exposing sensitive data
- [ ] **Supabase Dashboard** monitoring set up

### **🌐 Fallback Strategy**
- [ ] **Web fallback page** (optional) for problematic email clients
- [ ] **Manual OTP entry** working as backup method ✅
- [ ] **Support contact** available for users who can't authenticate

## **⚠️ Common Production Failures**

### **Environment Footguns**
- ❌ Using localhost URLs in production build
- ❌ Placeholder credentials in production .env
- ❌ Wrong Supabase project (dev instead of prod)

### **Deep Link Footguns**  
- ❌ Custom scheme not working in email clients
- ❌ Universal Links not configured
- ❌ Deep links working in simulator but not device

### **Database Footguns**
- ❌ Whitelist function not accessible to anon users
- ❌ RLS policies blocking authentication
- ❌ Empty whitelist table

### **Email Footguns**
- ❌ Magic links going to spam folder
- ❌ Email client blocking custom schemes
- ❌ Rate limits hit too quickly

## **🚨 Emergency Rollback Plan**

If magic link authentication fails in production:

1. **Immediate Actions**
   - [ ] Check Supabase dashboard for error logs
   - [ ] Verify email delivery status
   - [ ] Test with different email clients

2. **Temporary Workarounds**
   - [ ] Guide users to use manual OTP entry
   - [ ] Provide web fallback URL
   - [ ] Temporarily disable rate limiting if needed

3. **Communication**
   - [ ] In-app message about authentication issues
   - [ ] Support contact for affected users
   - [ ] Status page update if applicable

## **✅ Post-Deployment Verification**

After deploying to production:

- [ ] **Send test magic link** to your own whitelisted email
- [ ] **Complete authentication flow** on both iOS and Android
- [ ] **Monitor error logs** for first 24 hours
- [ ] **Check email delivery metrics** in Supabase
- [ ] **Verify rate limiting** works correctly
- [ ] **Test error scenarios** still work as expected

---

**📞 Need Help?**
If you encounter issues during deployment, refer to `magic-link-footguns.md` for detailed troubleshooting steps.

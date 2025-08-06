# Manual Authentication Testing Guide

## 🎯 **Testing Scenarios**

### **Scenario 1: Successful Whitelisted Email Flow**

**Steps:**
1. Start app: `npm run ios`
2. Navigate to authentication screen
3. Enter: `roger@harrisconsulting.com`
4. Tap "Send Verification Code"
5. Check email for magic link
6. Test both flows:
   - **Magic Link**: Tap link in email → Should open app and authenticate
   - **Manual OTP**: Enter 6-digit code → Should authenticate

**Expected Results:**
- ✅ Email input validates correctly
- ✅ "Verification code sent" message appears
- ✅ Email arrives within 30 seconds
- ✅ Magic link opens app directly
- ✅ Manual OTP code works
- ✅ User is authenticated and navigated to protected content

### **Scenario 2: Non-Whitelisted Email Rejection**

**Steps:**
1. Enter: `notwhitelisted@example.com`
2. Tap "Send Verification Code"

**Expected Results:**
- ❌ Error message: "This email is not authorized to access the application"
- ❌ No email sent
- ❌ User remains on authentication screen

### **Scenario 3: Rate Limiting Validation**

**Steps:**
1. Enter whitelisted email
2. Tap "Send Verification Code"
3. Immediately tap "Send Verification Code" again

**Expected Results:**
- ✅ First request succeeds
- ⏱️ Second request shows "Please wait 60 seconds before requesting another code"
- ⏱️ Button shows countdown timer

### **Scenario 4: Invalid Email Format**

**Steps:**
1. Test these invalid formats:
   - `invalid-email`
   - `@example.com`
   - `test@`
   - ` ` (spaces)

**Expected Results:**
- ❌ Email validation prevents submission
- ❌ Clear error message for each case
- ❌ No network requests made

### **Scenario 5: Deep Link Testing** (Physical Device Required)

**Steps:**
1. Request magic link on physical device
2. Tap magic link in email app
3. Verify app opens automatically

**Expected Results:**
- ✅ App opens from email tap
- ✅ Authentication completes automatically
- ✅ User navigated to intended destination

## 🔍 **Debugging Commands**

```bash
# Check React Native logs
npx react-native log-ios

# Check Metro bundler
npm start -- --verbose

# Verify environment variables
node -e "console.log('SUPABASE_URL:', process.env.SUPABASE_URL)"

# Test Supabase connection
curl -X GET "https://kummmbuildcstnzahzsy.supabase.co/rest/v1/" \
  -H "apikey: YOUR_ANON_KEY"
```

## 📱 **Device-Specific Testing**

### **iOS Simulator Testing**
```bash
npm run ios --simulator="iPhone 15 Pro"
```

### **Physical Device Testing**
```bash
npm run ios --device "Your iPhone Name"
```

### **Android Testing**
```bash
npm run android
```

## ✅ **Success Validation Checklist**

- [ ] Whitelisted emails receive magic links
- [ ] Non-whitelisted emails are rejected clearly
- [ ] Rate limiting prevents spam requests
- [ ] Magic links open app automatically
- [ ] Manual OTP codes work as fallback
- [ ] Session persists across app restarts
- [ ] No console errors during authentication
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
# Supabase Magic Link Override Troubleshooting

**Date**: August 6, 2025  
**Status**: ✅ RESOLVED - Root cause identified  
**Issue**: OTP emails contained magic links despite correct Confirm signup template  
**Priority**: HIGH - Issue resolved with template discovery  
**Resolution**: Supabase uses Magic Link template for OTP emails, not Confirm signup template

---

## 🚨 **PROBLEM STATEMENT - RESOLVED**

Despite correctly configuring the Supabase "Confirm signup" email template with OTP HTML content, users were still receiving magic link emails instead of 6-digit verification codes.

**Confirmed Working Elements:**
- ✅ Confirm signup template contains correct OTP HTML with `{{ .Token }}`
- ✅ React Native code uses `type: 'email'` for OTP authentication
- ✅ Supabase project settings appear correct
- ✅ Email delivery is working (wrong content type)

**Core Issue - IDENTIFIED:**
✅ **Supabase uses the Magic Link email template for OTP emails, not the Confirm signup template**

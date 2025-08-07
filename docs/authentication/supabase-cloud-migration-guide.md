# 🚀 Supabase Cloud Migration Instructions

## **Phase 1.5: Apply Schema Changes to Supabase Cloud**

### **🎯 Objective**
Update your Supabase cloud database (`kummmbuildcstnzahzsy.supabase.co`) with the preferred name and preferences schema enhancements.

---

## **📋 Step-by-Step Instructions**

### **Step 1: Access Supabase Dashboard**
1. Open your browser and go to: https://supabase.com/dashboard
2. Log in to your Supabase account
3. Select your project: **kummmbuildcstnzahzsy**

### **Step 2: Open SQL Editor**
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** to create a new SQL script

### **Step 3: Apply Migration Script**
1. Open the file: `supabase/cloud-migration-script.sql`
2. **Copy the entire contents** of the script
3. **Paste it** into the Supabase SQL Editor
4. Click **"Run"** to execute the script

### **Step 4: Verify Migration Success**
The script includes a verification query at the bottom. After running, you should see:

```
check_type        | result
Migration Status  | ✅ Columns added successfully
Index Status      | ✅ Indexes created successfully  
Function Status   | ✅ Functions created successfully
Data Status       | ✅ Existing users have default preferences
```

---

## **🔍 What This Migration Does**

### **Schema Changes:**
- ✅ Adds `preferred_name` column to `user_profiles` table
- ✅ Adds `preferences` JSONB column for flexible preference storage
- ✅ Creates performance indexes for efficient queries
- ✅ Adds validation constraints (preferred name max 50 characters)

### **Security Functions:**
- ✅ `update_user_preferences()` - Secure preference updates with validation
- ✅ `get_user_preferences()` - Secure preference retrieval with access control
- ✅ `validate_preferences()` - Validates preference structure and values

### **Data Initialization:**
- ✅ Sets default preferences for existing users
- ✅ Maintains backward compatibility with current authentication flow

---

## **⚠️ Important Notes**

### **Before Running:**
- ✅ This migration is **safe** and **non-breaking**
- ✅ All existing user data will be preserved
- ✅ Current authentication flow will continue working
- ✅ New columns are optional and have sensible defaults

### **Expected Execution Time:**
- **Small database** (< 100 users): ~10 seconds
- **Medium database** (< 1000 users): ~30 seconds
- **Large database** (> 1000 users): ~1-2 minutes

### **Rollback Plan:**
If needed, you can rollback the changes with:
```sql
-- Remove columns (CAUTION: This will delete data)
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS preferred_name,
DROP COLUMN IF EXISTS preferences;

-- Drop functions
DROP FUNCTION IF EXISTS update_user_preferences(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_user_preferences(UUID);
DROP FUNCTION IF EXISTS validate_preferences(JSONB);
```

---

## **🎯 After Migration**

Once the migration completes successfully:

1. **✅ Database is ready** for Phase 2 implementation
2. **✅ TypeScript interfaces** match database schema
3. **✅ Security functions** are available for authentication service
4. **✅ Performance indexes** are in place for efficient queries

---

## **🚨 Troubleshooting**

### **If Migration Fails:**
1. **Check error message** in Supabase SQL Editor
2. **Verify permissions** - ensure you're the project owner
3. **Run verification query** separately to check partial completion
4. **Contact support** if needed with error details

### **Common Issues:**
- **"Column already exists"** - Safe to ignore, script is idempotent
- **"Function already exists"** - Safe to ignore, using CREATE OR REPLACE
- **"Permission denied"** - Ensure you're the project owner or have proper permissions

---

## **✅ Success Confirmation**

After successful migration, you should be able to:
- ✅ See new columns in Supabase Table Editor under `user_profiles`
- ✅ See new functions in Supabase Database > Functions
- ✅ Proceed to Phase 2: Authentication Service Enhancement

**Ready to proceed once migration is complete!** 🚀

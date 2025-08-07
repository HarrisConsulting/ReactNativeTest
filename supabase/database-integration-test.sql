-- Quick Test: Verify Database Functions Work with App
-- Run this in Supabase SQL Editor to test the preference functions

-- Test 1: Check if preference functions exist and are accessible
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN ('update_user_preferences', 'get_user_preferences', 'check_whitelist')
ORDER BY routine_name;

-- Test 2: Test whitelist function with a test email
SELECT check_whitelist('test@example.com') as is_whitelisted;

-- Test 3: Check user_profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Test 4: Verify JSONB preferences structure with sample data
SELECT 
  'Sample preference structure' as test_name,
  validate_preferences('{"notifications": {"email": true}, "gamePreferences": {"skillLevel": "Intermediate"}}'::jsonb) as is_valid;

-- Expected Results:
-- Test 1: Should show 3 functions (update_user_preferences, get_user_preferences, check_whitelist)
-- Test 2: Should return true (test@example.com is whitelisted)
-- Test 3: Should show user_profiles columns including preferred_name and preferences
-- Test 4: Should return true (valid preference structure)

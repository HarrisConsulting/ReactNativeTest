-- Quick Check: Supabase Database Current State
-- Run this in Supabase SQL Editor to see what tables currently exist

-- Check if our main tables exist
SELECT 
  'email_whitelist' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_whitelist')
    THEN '✅ Table exists'
    ELSE '❌ Table does not exist'
  END as status
UNION ALL
SELECT 
  'user_profiles' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
    THEN '✅ Table exists'
    ELSE '❌ Table does not exist'
  END as status;

-- If tables exist, check their structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('email_whitelist', 'user_profiles')
ORDER BY table_name, ordinal_position;

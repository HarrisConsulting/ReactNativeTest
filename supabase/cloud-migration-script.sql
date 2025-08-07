-- ================================================================
-- SUPABASE CLOUD INITIAL SETUP: Complete Schema Creation
-- Project: kummmbuildcstnzahzsy.supabase.co
-- Date: August 7, 2025
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to https://supabase.com/dashboard/project/kummmbuildcstnzahzsy/sql
-- 3. Paste and run this script
-- 4. Verify results with the verification query at the bottom
-- ================================================================

-- Step 1: Create Email Whitelist Table
CREATE TABLE IF NOT EXISTS email_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create User Profiles Table (with preferred name and preferences from start)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  preferred_name TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add constraint for preferred name validation
ALTER TABLE user_profiles 
ADD CONSTRAINT IF NOT EXISTS chk_preferred_name_length 
CHECK (preferred_name IS NULL OR (LENGTH(TRIM(preferred_name)) > 0 AND LENGTH(TRIM(preferred_name)) <= 50));

-- Step 4: Enable Row Level Security
ALTER TABLE email_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies for email_whitelist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_whitelist' 
    AND policyname = 'Allow reading email whitelist for auth checks'
  ) THEN
    CREATE POLICY "Allow reading email whitelist for auth checks" ON email_whitelist
      FOR SELECT
      USING (status = 'active');
  END IF;
END $$;

-- Step 6: Create RLS Policies for user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" ON user_profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON user_profiles
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Allow profile creation on signup'
  ) THEN
    CREATE POLICY "Allow profile creation on signup" ON user_profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Step 7: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_email_whitelist_email ON email_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_name 
  ON user_profiles(preferred_name) 
  WHERE preferred_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences 
  ON user_profiles USING GIN (preferences);

-- Step 8: Create email whitelist checking function
CREATE OR REPLACE FUNCTION check_whitelist(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_whitelist 
    WHERE email = LOWER(TRIM(email_input))
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to anon users (required for magic link auth)
GRANT EXECUTE ON FUNCTION check_whitelist(TEXT) TO anon;

-- Step 9: Insert test whitelisted emails
INSERT INTO email_whitelist (email) VALUES 
  ('test@example.com'),
  ('admin@example.com'),
  ('user@example.com')
ON CONFLICT (email) DO NOTHING;

-- Step 10: Create preference management functions
CREATE OR REPLACE FUNCTION update_user_preferences(
  user_id UUID,
  new_preferred_name TEXT DEFAULT NULL,
  new_preferences JSONB DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_preferences JSONB;
  merged_preferences JSONB;
BEGIN
  -- Validate user exists and is authenticated
  IF user_id IS NULL OR user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Validate preferred name length if provided
  IF new_preferred_name IS NOT NULL THEN
    IF LENGTH(TRIM(new_preferred_name)) = 0 OR LENGTH(TRIM(new_preferred_name)) > 50 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Get current preferences for merging
  SELECT preferences INTO current_preferences
  FROM user_profiles
  WHERE id = user_id;
  
  -- Merge new preferences with existing ones
  IF new_preferences IS NOT NULL THEN
    merged_preferences := COALESCE(current_preferences, '{}'::JSONB) || new_preferences;
  ELSE
    merged_preferences := current_preferences;
  END IF;
  
  -- Update the user profile
  UPDATE user_profiles 
  SET 
    preferred_name = CASE 
      WHEN new_preferred_name IS NOT NULL THEN TRIM(new_preferred_name)
      ELSE preferred_name 
    END,
    preferences = COALESCE(merged_preferences, preferences),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

-- Step 11: Create preference retrieval function
CREATE OR REPLACE FUNCTION get_user_preferences(user_id UUID)
RETURNS TABLE(
  preferred_name TEXT,
  preferences JSONB
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate user can access this data
  IF user_id IS NULL OR user_id != auth.uid() THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    up.preferred_name,
    COALESCE(up.preferences, '{}'::JSONB) as preferences
  FROM user_profiles up
  WHERE up.id = user_id;
END;
$$;

-- Step 12: Create preference validation function
CREATE OR REPLACE FUNCTION validate_preferences(prefs JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  valid_game_types TEXT[] := ARRAY['Arcade', 'Strategy', 'RPG', 'Puzzle', 'Action', 'Sports'];
  game_type TEXT;
BEGIN
  -- Check if gameTypes array contains only valid values
  IF prefs ? 'gameTypes' THEN
    IF jsonb_typeof(prefs->'gameTypes') != 'array' THEN
      RETURN FALSE;
    END IF;
    
    FOR game_type IN SELECT jsonb_array_elements_text(prefs->'gameTypes')
    LOOP
      IF NOT (game_type = ANY(valid_game_types)) THEN
        RETURN FALSE;
      END IF;
    END LOOP;
  END IF;
  
  -- Check theme value if present
  IF prefs ? 'theme' THEN
    IF NOT (prefs->>'theme' IN ('light', 'dark')) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Validate notifications structure if present
  IF prefs ? 'notifications' THEN
    IF jsonb_typeof(prefs->'notifications') != 'object' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Validate device preferences structure if present
  IF prefs ? 'device' THEN
    IF jsonb_typeof(prefs->'device') != 'object' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Step 13: Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_user_preferences(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_preferences(JSONB) TO authenticated;

-- Step 14: Add helpful comments
COMMENT ON TABLE email_whitelist IS 'Pre-approved email addresses for authentication';
COMMENT ON TABLE user_profiles IS 'User profiles with authentication data, preferred names, and preferences';
COMMENT ON COLUMN user_profiles.preferred_name IS 'User-chosen display name (max 50 chars)';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences stored as JSONB for flexibility';

-- ================================================================
-- VERIFICATION QUERY - Run this after the initial setup
-- ================================================================
-- This query will confirm the complete setup was successful
SELECT 
  'Table Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name IN ('email_whitelist', 'user_profiles')
    ) THEN '✅ Tables created successfully'
    ELSE '❌ Tables not found'
  END as result
UNION ALL
SELECT 
  'Column Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name IN ('preferred_name', 'preferences')
    ) THEN '✅ Preference columns added successfully'
    ELSE '❌ Preference columns not found'
  END as result
UNION ALL
SELECT 
  'Index Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'user_profiles' 
      AND indexname IN ('idx_user_profiles_preferences', 'idx_user_profiles_preferred_name')
    ) THEN '✅ Indexes created successfully'
    ELSE '❌ Indexes not found'
  END as result
UNION ALL
SELECT 
  'Function Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name IN ('update_user_preferences', 'get_user_preferences', 'validate_preferences', 'check_whitelist')
    ) THEN '✅ Functions created successfully'
    ELSE '❌ Functions not found'
  END as result
UNION ALL
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename IN ('email_whitelist', 'user_profiles') 
      AND rowsecurity = true
    ) THEN '✅ Row Level Security enabled'
    ELSE '❌ RLS not properly configured'
  END as result
UNION ALL
SELECT 
  'Whitelist Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM email_whitelist) 
    THEN '✅ Test emails added to whitelist'
    ELSE '⚠️ Whitelist is empty'
  END as result;

-- ================================================================
-- INITIAL SETUP COMPLETE
-- Expected output: All checks should show ✅ status
-- ================================================================

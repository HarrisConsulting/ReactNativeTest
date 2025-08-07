-- ================================================================
-- SUPABASE CLOUD MIGRATION: Preferred Name and Preferences
-- Project: kummmbuildcstnzahzsy.supabase.co
-- Date: August 7, 2025
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to https://supabase.com/dashboard/project/kummmbuildcstnzahzsy/sql
-- 3. Paste and run this script
-- 4. Verify results with the verification query at the bottom
-- ================================================================

-- Step 1: Add new columns to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Step 2: Add constraint for preferred name validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'chk_preferred_name_length'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT chk_preferred_name_length 
    CHECK (preferred_name IS NULL OR (LENGTH(TRIM(preferred_name)) > 0 AND LENGTH(TRIM(preferred_name)) <= 50));
  END IF;
END $$;

-- Step 3: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_name 
  ON user_profiles(preferred_name) 
  WHERE preferred_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences 
  ON user_profiles USING GIN (preferences);

-- Step 4: Initialize existing users with default preferences
UPDATE user_profiles 
SET preferences = COALESCE(preferences, '{
  "notifications": {
    "email": true,
    "push": false
  },
  "device": {
    "rememberDevice": false
  }
}'::JSONB)
WHERE preferences IS NULL OR preferences = '{}'::JSONB;

-- Step 5: Create preference management functions
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

-- Step 6: Create preference retrieval function
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

-- Step 7: Create preference validation function
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

-- Step 8: Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_user_preferences(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_preferences(JSONB) TO authenticated;

-- Step 9: Add helpful comments
COMMENT ON COLUMN user_profiles.preferred_name IS 'User-chosen display name (max 50 chars)';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences stored as JSONB for flexibility';

-- ================================================================
-- VERIFICATION QUERY - Run this after the migration
-- ================================================================
-- This query will confirm the migration was successful
SELECT 
  'Migration Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name IN ('preferred_name', 'preferences')
    ) THEN '✅ Columns added successfully'
    ELSE '❌ Columns not found'
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
      WHERE routine_name IN ('update_user_preferences', 'get_user_preferences', 'validate_preferences')
    ) THEN '✅ Functions created successfully'
    ELSE '❌ Functions not found'
  END as result
UNION ALL
SELECT 
  'Data Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE preferences IS NOT NULL) 
    THEN '✅ Existing users have default preferences'
    ELSE '⚠️ No users found or preferences not initialized'
  END as result;

-- ================================================================
-- MIGRATION COMPLETE
-- Expected output: All checks should show ✅ status
-- ================================================================

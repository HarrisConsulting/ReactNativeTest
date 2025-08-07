-- Migration: Add Preferred Name and Preferences to User Profiles
-- Date: August 7, 2025
-- Description: Extends user_profiles table with preferred_name and preferences fields
-- This migration is safe to run on existing databases with user data

-- =================================================================
-- PHASE 1: ADD NEW COLUMNS TO EXISTING TABLE
-- =================================================================

-- Add preferred_name column (optional, up to 50 characters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'preferred_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferred_name TEXT;
    
    -- Add constraint for preferred name length
    ALTER TABLE user_profiles ADD CONSTRAINT chk_preferred_name_length 
      CHECK (preferred_name IS NULL OR (LENGTH(TRIM(preferred_name)) > 0 AND LENGTH(TRIM(preferred_name)) <= 50));
  END IF;
END
$$;

-- Add preferences column (JSONB for flexible storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{}';
  END IF;
END
$$;

-- =================================================================
-- PHASE 2: CREATE PERFORMANCE INDEXES
-- =================================================================

-- Index for preferred name searches (if needed for future features)
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_name 
  ON user_profiles(preferred_name) 
  WHERE preferred_name IS NOT NULL;

-- GIN index for JSONB preferences queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences 
  ON user_profiles USING GIN (preferences);

-- =================================================================
-- PHASE 3: INITIALIZE EXISTING USER PREFERENCES
-- =================================================================

-- Set default preferences for existing users (if any exist)
-- This preserves any existing functionality and provides a baseline
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

-- =================================================================
-- PHASE 4: UPDATE ROW LEVEL SECURITY POLICIES
-- =================================================================

-- Ensure existing RLS policies cover new columns
-- (The existing policies should already work since they use the user id)

-- Add policy comment for documentation
COMMENT ON TABLE user_profiles IS 'User profiles with authentication data, preferred names, and preferences. Enhanced August 7, 2025.';
COMMENT ON COLUMN user_profiles.preferred_name IS 'User-chosen display name (max 50 chars)';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences stored as JSONB for flexibility';

-- =================================================================
-- PHASE 5: VALIDATION AND VERIFICATION
-- =================================================================

-- Create a function to verify the migration succeeded
CREATE OR REPLACE FUNCTION verify_preferences_migration()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  column_count INTEGER;
  index_count INTEGER;
  user_count INTEGER;
  users_with_prefs INTEGER;
BEGIN
  -- Check that columns exist
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'user_profiles' 
  AND column_name IN ('preferred_name', 'preferences');
  
  -- Check that indexes exist
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE tablename = 'user_profiles' 
  AND indexname IN ('idx_user_profiles_preferred_name', 'idx_user_profiles_preferences');
  
  -- Check user data
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  SELECT COUNT(*) INTO users_with_prefs 
  FROM user_profiles 
  WHERE preferences IS NOT NULL AND preferences != '{}'::JSONB;
  
  -- Return migration status
  IF column_count = 2 AND index_count >= 1 THEN
    RETURN FORMAT(
      'Migration SUCCESS: Columns added (%s/2), Indexes created (%s), Users: %s, Users with preferences: %s',
      column_count, index_count, user_count, users_with_prefs
    );
  ELSE
    RETURN FORMAT(
      'Migration ISSUE: Columns added (%s/2), Indexes created (%s). Check logs.',
      column_count, index_count
    );
  END IF;
END;
$$;

-- Run verification
SELECT verify_preferences_migration();

-- =================================================================
-- MIGRATION COMPLETE
-- =================================================================

-- Log successful completion
INSERT INTO auth_logs (email, attempt_type, success, ip_address, user_agent) 
VALUES (
  'system@migration', 
  'migration', 
  true, 
  'localhost', 
  'Preferred Name Migration Script v1.0'
) ON CONFLICT DO NOTHING;

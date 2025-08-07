-- Enhanced Supabase Security Functions for Email Whitelist
-- Based on production-ready patterns from ReactNativeTest documentation

-- Create secure email whitelist checking function
CREATE OR REPLACE FUNCTION check_email_whitelist(email_input TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_whitelist 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(email_input)) 
    AND status = 'active'
  );
END;
$$;

-- Create function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Create function to log authentication attempts (for security monitoring)
CREATE OR REPLACE FUNCTION log_auth_attempt(
  email_input TEXT,
  attempt_type TEXT,
  success BOOLEAN,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO auth_logs (
    email,
    attempt_type,
    success,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    LOWER(TRIM(email_input)),
    attempt_type,
    success,
    ip_address,
    user_agent,
    NOW()
  );
END;
$$;

-- Create auth logs table for security monitoring
CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'verify', 'magic_link')),
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance on auth logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_email_created ON auth_logs(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_type_created ON auth_logs(attempt_type, created_at DESC);

-- Enable RLS on auth logs
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to read auth logs (for admin monitoring)
CREATE POLICY "Service role can read auth logs" ON auth_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Allow inserting auth logs for monitoring
CREATE POLICY "Allow auth log insertion" ON auth_logs
  FOR INSERT
  WITH CHECK (true);

-- =================================================================
-- USER PREFERENCES MANAGEMENT FUNCTIONS
-- =================================================================

-- Function to safely update user preferences and preferred name
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

-- Function to get user preferences (with proper access control)
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

-- Function to validate preference structure
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_user_preferences(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_preferences(JSONB) TO authenticated;

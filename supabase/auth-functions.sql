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

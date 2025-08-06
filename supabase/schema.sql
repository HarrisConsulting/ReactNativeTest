-- Email Whitelist Table
-- This table contains pre-approved email addresses
CREATE TABLE email_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table  
-- Links authenticated users to their profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for email_whitelist
ALTER TABLE email_whitelist ENABLE ROW LEVEL SECURITY;

-- Allow reading email_whitelist for authentication checks
CREATE POLICY "Allow reading email whitelist for auth checks" ON email_whitelist
  FOR SELECT
  USING (status = 'active');

-- RLS Policies for user_profiles  
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow inserting profile on signup
CREATE POLICY "Allow profile creation on signup" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes for performance
CREATE INDEX idx_email_whitelist_email ON email_whitelist(email);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Function to check if email is whitelisted (prevents RLS footguns)
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

-- Insert some test whitelisted emails
INSERT INTO email_whitelist (email) VALUES 
  ('test@example.com'),
  ('admin@example.com'),
  ('user@example.com');

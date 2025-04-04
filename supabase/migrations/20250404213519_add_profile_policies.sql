-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy to allow users to view any profile
CREATE POLICY "Profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (true);

-- Policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id); 
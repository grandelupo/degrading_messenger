-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.avatar_url IS 'URL of the user''s avatar image';

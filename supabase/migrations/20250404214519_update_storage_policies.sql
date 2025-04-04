-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Allow users to update their avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Allow users to delete their avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public access to view avatars
CREATE POLICY "Allow public to view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars'); 
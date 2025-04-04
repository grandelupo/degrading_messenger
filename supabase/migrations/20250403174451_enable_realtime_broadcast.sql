-- First, drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create a new publication for real-time that includes the messages table
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Enable replica identity for messages table (required for real-time)
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users who are part of the conversation" ON messages;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable update access for message senders" ON messages;

-- Create new policies that explicitly allow real-time access
CREATE POLICY "Enable read access for users who are part of the conversation"
    ON messages FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "Enable insert access for authenticated users"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Enable update access for message senders"
    ON messages FOR UPDATE
    USING (
        auth.uid() = sender_id
    )
    WITH CHECK (
        auth.uid() = sender_id
    );

-- Enable row level security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

-- Configure real-time for specific columns
ALTER PUBLICATION supabase_realtime SET TABLE messages
    FOR ALL OPERATIONS; 
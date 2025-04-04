-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Ensure the trigger for last_updated is working correctly
DROP TRIGGER IF EXISTS update_messages_last_updated ON messages;

CREATE OR REPLACE FUNCTION update_messages_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.content IS DISTINCT FROM OLD.content) THEN
        NEW.last_updated = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_last_updated
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_last_updated();

-- Grant necessary permissions
ALTER TABLE messages ENABLE REPLICA IDENTITY FULL;

-- Ensure RLS policies allow real-time updates
CREATE POLICY "Enable read access for users who are part of the conversation"
    ON messages FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "Enable insert access for authenticated users"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Enable update access for message senders"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

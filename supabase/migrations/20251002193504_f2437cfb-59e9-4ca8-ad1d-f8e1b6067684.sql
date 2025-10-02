-- Add phone number to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Create conversations table for 1-to-1 chats
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 < participant_2)
);

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  attachment_type text,
  attachment_name text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Enable RLS on direct_messages
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for direct_messages
CREATE POLICY "Users can view messages in their conversations"
ON direct_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = direct_messages.conversation_id
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages"
ON direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages"
ON direct_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = direct_messages.conversation_id
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);

-- Function to update last_message_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON direct_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
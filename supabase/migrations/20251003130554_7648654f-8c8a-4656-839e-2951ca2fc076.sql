-- Fix conversations table foreign keys to reference profiles instead of auth.users
-- Drop existing foreign keys if they exist
ALTER TABLE public.conversations 
  DROP CONSTRAINT IF EXISTS conversations_participant_1_fkey,
  DROP CONSTRAINT IF EXISTS conversations_participant_2_fkey;

-- Add proper foreign keys referencing profiles table
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_participant_1_fkey 
    FOREIGN KEY (participant_1) 
    REFERENCES public.profiles(user_id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT conversations_participant_2_fkey 
    FOREIGN KEY (participant_2) 
    REFERENCES public.profiles(user_id) 
    ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
  ON public.conversations(participant_1, participant_2);

-- Ensure RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
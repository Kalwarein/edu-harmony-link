-- Enable real-time for tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
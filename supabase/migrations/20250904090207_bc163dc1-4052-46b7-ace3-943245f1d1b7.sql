-- Create events table for calendar functionality
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,
  end_time TIME,
  location TEXT,
  event_type TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Everyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create reactions table for posts
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Everyone can view reactions" 
ON public.reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reactions" 
ON public.reactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reactions" 
ON public.reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comments table for posts
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Everyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create calls table for video call history
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'video',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  participants TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Enable Row Level Security
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Create policies for calls
CREATE POLICY "Everyone can view calls" 
ON public.calls 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create calls" 
ON public.calls 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update calls" 
ON public.calls 
FOR UPDATE 
USING (auth.uid() = caller_id OR auth.uid()::text = ANY(participants));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
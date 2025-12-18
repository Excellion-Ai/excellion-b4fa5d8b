-- Create bookmarks table for saving project snapshots
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  spec JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmark access
CREATE POLICY "Anyone can view bookmarks" 
ON public.bookmarks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create bookmarks" 
ON public.bookmarks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update bookmarks" 
ON public.bookmarks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete bookmarks" 
ON public.bookmarks 
FOR DELETE 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_bookmarks_project_id ON public.bookmarks(project_id);
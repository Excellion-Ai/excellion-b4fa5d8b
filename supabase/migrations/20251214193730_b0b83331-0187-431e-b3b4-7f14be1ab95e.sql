-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create builder_projects table to store generated website projects
CREATE TABLE public.builder_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  idea TEXT NOT NULL,
  spec JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builder_projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert projects (for now, before auth is added)
CREATE POLICY "Anyone can insert projects"
ON public.builder_projects
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view projects (for now)
CREATE POLICY "Anyone can view projects"
ON public.builder_projects
FOR SELECT
USING (true);

-- Allow anyone to update projects (for now)
CREATE POLICY "Anyone can update projects"
ON public.builder_projects
FOR UPDATE
USING (true);

-- Allow anyone to delete projects (for now)
CREATE POLICY "Anyone can delete projects"
ON public.builder_projects
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_builder_projects_updated_at
BEFORE UPDATE ON public.builder_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
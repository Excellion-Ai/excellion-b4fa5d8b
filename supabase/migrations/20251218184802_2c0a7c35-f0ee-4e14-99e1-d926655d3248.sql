-- Create knowledge_base table for storing brand docs and guidelines
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT DEFAULT 'text',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge base access
CREATE POLICY "Anyone can view knowledge base entries" 
ON public.knowledge_base 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create knowledge base entries" 
ON public.knowledge_base 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update knowledge base entries" 
ON public.knowledge_base 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete knowledge base entries" 
ON public.knowledge_base 
FOR DELETE 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_knowledge_base_project_id ON public.knowledge_base(project_id);

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
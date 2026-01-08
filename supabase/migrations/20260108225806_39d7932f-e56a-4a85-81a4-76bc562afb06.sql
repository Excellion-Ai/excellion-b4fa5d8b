-- Add builder_project_id to courses table to link with builder_projects
ALTER TABLE public.courses 
ADD COLUMN builder_project_id uuid REFERENCES public.builder_projects(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_courses_builder_project_id ON public.courses(builder_project_id);
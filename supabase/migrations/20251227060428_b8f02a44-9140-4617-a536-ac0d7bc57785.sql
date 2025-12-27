-- Assign all orphaned projects to the user's account
UPDATE public.builder_projects 
SET user_id = 'c93703a7-c73c-475f-a544-6dd7382a1da3'
WHERE user_id IS NULL;
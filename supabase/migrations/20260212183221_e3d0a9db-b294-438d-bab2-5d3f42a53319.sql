
-- Re-add the FK constraint
ALTER TABLE public.courses ADD CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Add RLS policy to allow anyone to view the system-owned quickstart course
CREATE POLICY "Anyone can view system courses" ON public.courses FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

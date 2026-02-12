
-- Drop the FK constraint first
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_user_id_fkey;

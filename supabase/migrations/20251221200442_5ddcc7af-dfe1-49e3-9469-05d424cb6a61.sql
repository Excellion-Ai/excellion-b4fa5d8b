-- Drop existing overly permissive policies on builder_projects
DROP POLICY IF EXISTS "Anyone can view projects" ON builder_projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON builder_projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON builder_projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON builder_projects;

-- Create proper owner-scoped policies
-- Allow users to view their own projects OR anonymous projects (user_id IS NULL)
CREATE POLICY "Users can view own projects" 
  ON builder_projects FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to insert their own projects OR anonymous projects
CREATE POLICY "Users can insert own projects" 
  ON builder_projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own projects OR anonymous projects
CREATE POLICY "Users can update own projects" 
  ON builder_projects FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete their own projects OR anonymous projects
CREATE POLICY "Users can delete own projects" 
  ON builder_projects FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to manage all projects
CREATE POLICY "Admins can manage all projects" 
  ON builder_projects FOR ALL 
  USING (has_role(auth.uid(), 'admin'));
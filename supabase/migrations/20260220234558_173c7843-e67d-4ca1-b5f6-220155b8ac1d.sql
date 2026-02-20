CREATE TABLE public.course_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mode TEXT DEFAULT 'build',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat history for their courses"
  ON public.course_chat_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.courses WHERE courses.id = course_chat_history.course_id AND courses.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert chat history for their courses"
  ON public.course_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.courses WHERE courses.id = course_chat_history.course_id AND courses.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete chat history for their courses"
  ON public.course_chat_history FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.courses WHERE courses.id = course_chat_history.course_id AND courses.user_id = auth.uid()
  ));

CREATE INDEX idx_course_chat_history_course_id ON public.course_chat_history(course_id);
CREATE INDEX idx_course_chat_history_created_at ON public.course_chat_history(course_id, created_at);
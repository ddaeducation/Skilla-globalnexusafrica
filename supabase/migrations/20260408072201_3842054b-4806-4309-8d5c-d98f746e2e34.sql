-- Gamification: XP points and levels
CREATE TABLE public.student_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xp_points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'system',
  source_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_xp_user ON public.student_xp(user_id);

ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP" ON public.student_xp
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert XP" ON public.student_xp
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Lesson-level discussion comments
CREATE TABLE public.lesson_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lesson_content(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_comments_lesson ON public.lesson_comments(lesson_id);
CREATE INDEX idx_lesson_comments_course ON public.lesson_comments(course_id);

ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users can view lesson comments" ON public.lesson_comments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid() AND e.course_id = lesson_comments.course_id AND e.payment_status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM course_instructors ci WHERE ci.instructor_id = auth.uid() AND ci.course_id = lesson_comments.course_id
    )
    OR EXISTS (
      SELECT 1 FROM courses c WHERE c.id = lesson_comments.course_id AND c.instructor_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Enrolled users can insert lesson comments" ON public.lesson_comments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.user_id = auth.uid() AND e.course_id = lesson_comments.course_id AND e.payment_status = 'completed'
      )
      OR EXISTS (
        SELECT 1 FROM course_instructors ci WHERE ci.instructor_id = auth.uid() AND ci.course_id = lesson_comments.course_id
      )
      OR EXISTS (
        SELECT 1 FROM courses c WHERE c.id = lesson_comments.course_id AND c.instructor_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own comments" ON public.lesson_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.lesson_comments
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );
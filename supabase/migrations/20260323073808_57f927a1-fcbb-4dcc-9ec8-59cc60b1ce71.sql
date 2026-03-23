
-- Video quiz points table: stores individual quiz questions at specific video timestamps
CREATE TABLE public.video_quiz_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lesson_content(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL DEFAULT 0,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice',
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  behavior TEXT NOT NULL DEFAULT 'any_answer',
  counts_toward_grade BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Video quiz point options table
CREATE TABLE public.video_quiz_point_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_quiz_point_id UUID NOT NULL REFERENCES public.video_quiz_points(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Video quiz point responses (student answers)
CREATE TABLE public.video_quiz_point_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_quiz_point_id UUID NOT NULL REFERENCES public.video_quiz_points(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_quiz_point_id, user_id)
);

-- Enable RLS
ALTER TABLE public.video_quiz_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_quiz_point_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_quiz_point_responses ENABLE ROW LEVEL SECURITY;

-- RLS for video_quiz_points
CREATE POLICY "Admins can manage all video quiz points"
  ON public.video_quiz_points FOR ALL TO public
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors can manage their video quiz points"
  ON public.video_quiz_points FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = video_quiz_points.course_id
    AND courses.instructor_id = auth.uid()
  ));

CREATE POLICY "Enrolled students can view video quiz points"
  ON public.video_quiz_points FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = video_quiz_points.course_id
    AND enrollments.user_id = auth.uid()
    AND enrollments.payment_status = 'completed'
  ));

-- RLS for video_quiz_point_options
CREATE POLICY "Admins can manage all video quiz options"
  ON public.video_quiz_point_options FOR ALL TO public
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors can manage their video quiz options"
  ON public.video_quiz_point_options FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM public.video_quiz_points vqp
    JOIN public.courses c ON c.id = vqp.course_id
    WHERE vqp.id = video_quiz_point_options.video_quiz_point_id
    AND c.instructor_id = auth.uid()
  ));

CREATE POLICY "Enrolled students can view video quiz options"
  ON public.video_quiz_point_options FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.video_quiz_points vqp
    JOIN public.enrollments e ON e.course_id = vqp.course_id
    WHERE vqp.id = video_quiz_point_options.video_quiz_point_id
    AND e.user_id = auth.uid()
    AND e.payment_status = 'completed'
  ));

-- RLS for video_quiz_point_responses
CREATE POLICY "Students can manage their own responses"
  ON public.video_quiz_point_responses FOR ALL TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all responses"
  ON public.video_quiz_point_responses FOR SELECT TO public
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors can view responses for their courses"
  ON public.video_quiz_point_responses FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = video_quiz_point_responses.course_id
    AND courses.instructor_id = auth.uid()
  ));

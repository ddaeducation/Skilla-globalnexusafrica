
-- Create module_ratings table for per-section/module ratings
CREATE TABLE public.module_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, section_id)
);

-- Enable RLS
ALTER TABLE public.module_ratings ENABLE ROW LEVEL SECURITY;

-- Students can view their own module ratings
CREATE POLICY "Users can view their own module ratings"
ON public.module_ratings FOR SELECT
USING (auth.uid() = user_id);

-- Students can insert their own module ratings
CREATE POLICY "Users can insert their own module ratings"
ON public.module_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can update their own module ratings
CREATE POLICY "Users can update their own module ratings"
ON public.module_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all module ratings"
ON public.module_ratings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Instructors can view ratings for their courses
CREATE POLICY "Instructors can view module ratings for their courses"
ON public.module_ratings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM courses WHERE courses.id = module_ratings.course_id AND courses.instructor_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_module_ratings_updated_at
BEFORE UPDATE ON public.module_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

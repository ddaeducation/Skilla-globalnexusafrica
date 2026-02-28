
-- Add required_watch_percentage to lesson_content (nullable, instructor sets per lesson)
ALTER TABLE public.lesson_content 
ADD COLUMN required_watch_percentage integer DEFAULT NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.lesson_content.required_watch_percentage IS 'Percentage of video that must be watched before lesson can be marked complete. NULL means no requirement.';

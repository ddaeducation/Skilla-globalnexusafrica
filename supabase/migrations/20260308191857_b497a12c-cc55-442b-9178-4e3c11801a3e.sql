
-- Add slug column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing courses
UPDATE public.courses 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate slugs by appending a suffix
WITH duplicates AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM public.courses
)
UPDATE public.courses c
SET slug = d.slug || '-' || d.rn
FROM duplicates d
WHERE c.id = d.id AND d.rn > 1;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON public.courses(slug);

-- Make slug NOT NULL with a default
ALTER TABLE public.courses ALTER COLUMN slug SET NOT NULL;

-- Create a trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.generate_course_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    );
    base_slug := TRIM(BOTH '-' FROM base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.courses WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER courses_generate_slug
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_course_slug();

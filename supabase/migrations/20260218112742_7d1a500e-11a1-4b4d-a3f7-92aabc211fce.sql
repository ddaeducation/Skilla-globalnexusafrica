
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS publish_status text NOT NULL DEFAULT 'draft' 
CHECK (publish_status IN ('draft', 'upcoming', 'live'));

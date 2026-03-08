ALTER TABLE public.courses ADD COLUMN pricing_type text NOT NULL DEFAULT 'monthly';
ALTER TABLE public.courses ADD COLUMN full_price numeric DEFAULT NULL;
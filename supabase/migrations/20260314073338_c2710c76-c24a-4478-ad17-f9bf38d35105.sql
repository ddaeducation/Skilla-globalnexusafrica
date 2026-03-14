
-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS has_disability boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS student_residence text,
  ADD COLUMN IF NOT EXISTS student_id text UNIQUE;

-- Create function to generate student ID (e.g., STU-20260314-XXXX)
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id text;
  v_exists boolean;
  v_seq int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM '[0-9]+$') AS int)), 0) + 1
  INTO v_seq
  FROM profiles
  WHERE student_id IS NOT NULL;
  
  v_id := 'STU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(v_seq::text, 5, '0');
  
  RETURN v_id;
END;
$$;

-- Update handle_new_user trigger to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, phone, country, education_level, year_of_birth, gender, employment_status, linkedin_profile, hear_about, referred_by_code, has_disability, student_residence, student_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'education_level',
    (NEW.raw_user_meta_data->>'year_of_birth')::integer,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'employment_status',
    NEW.raw_user_meta_data->>'linkedin_profile',
    NEW.raw_user_meta_data->>'hear_about',
    NEW.raw_user_meta_data->>'referred_by_code',
    COALESCE((NEW.raw_user_meta_data->>'has_disability')::boolean, false),
    NEW.raw_user_meta_data->>'student_residence',
    generate_student_id()
  );
  RETURN NEW;
END;
$$;

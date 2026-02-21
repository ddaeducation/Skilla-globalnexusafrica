
-- Drop the restrictive policies
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.instructor_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.instructor_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.instructor_applications;

-- Recreate as permissive policies
CREATE POLICY "Admins can manage all applications"
ON public.instructor_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own applications"
ON public.instructor_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
ON public.instructor_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

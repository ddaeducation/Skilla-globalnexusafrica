
-- Drop all existing restrictive policies on coupons
DROP POLICY IF EXISTS "Admins can manage all coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can view active coupons by code" ON public.coupons;
DROP POLICY IF EXISTS "Instructors can manage their course coupons" ON public.coupons;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage all coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active coupons by code"
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Instructors can manage their course coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (
  (EXISTS (SELECT 1 FROM courses WHERE courses.id = coupons.course_id AND courses.instructor_id = auth.uid()))
  OR (is_global = false AND created_by = auth.uid())
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM courses WHERE courses.id = coupons.course_id AND courses.instructor_id = auth.uid()))
  OR (is_global = false AND created_by = auth.uid())
);

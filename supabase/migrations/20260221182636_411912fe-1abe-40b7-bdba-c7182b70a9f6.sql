
-- Corporate accounts table
CREATE TABLE public.corporate_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  admin_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  max_seats INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all corporate accounts" ON public.corporate_accounts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Corporate admins can view their own account" ON public.corporate_accounts FOR SELECT USING (auth.uid() = admin_user_id);
CREATE POLICY "Corporate admins can update their own account" ON public.corporate_accounts FOR UPDATE USING (auth.uid() = admin_user_id);
CREATE POLICY "Authenticated users can create corporate accounts" ON public.corporate_accounts FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

-- Corporate members (employees)
CREATE TABLE public.corporate_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'removed')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all members" ON public.corporate_members FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Corporate admins can manage their members" ON public.corporate_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_members.corporate_account_id AND admin_user_id = auth.uid())
);
CREATE POLICY "Members can view their own record" ON public.corporate_members FOR SELECT USING (auth.uid() = user_id);

-- Corporate course licenses (bulk purchases)
CREATE TABLE public.corporate_course_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  total_seats INTEGER NOT NULL DEFAULT 1,
  used_seats INTEGER NOT NULL DEFAULT 0,
  price_per_seat NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_course_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all licenses" ON public.corporate_course_licenses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Corporate admins can view their licenses" ON public.corporate_course_licenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_course_licenses.corporate_account_id AND admin_user_id = auth.uid())
);

-- Corporate enrollments (employee-course assignments)
CREATE TABLE public.corporate_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.corporate_course_licenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.corporate_members(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'enrolled', 'completed', 'removed')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enrolled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all corporate enrollments" ON public.corporate_enrollments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Corporate admins can manage their enrollments" ON public.corporate_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_enrollments.corporate_account_id AND admin_user_id = auth.uid())
);
CREATE POLICY "Members can view their own enrollments" ON public.corporate_enrollments FOR SELECT USING (auth.uid() = user_id);

-- Corporate invoices
CREATE TABLE public.corporate_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all invoices" ON public.corporate_invoices FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Corporate admins can view their invoices" ON public.corporate_invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_invoices.corporate_account_id AND admin_user_id = auth.uid())
);

-- Quote requests
CREATE TABLE public.corporate_quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  number_of_employees INTEGER NOT NULL DEFAULT 1,
  courses_interested JSONB DEFAULT '[]'::jsonb,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'accepted', 'declined')),
  quoted_amount NUMERIC,
  quoted_currency TEXT DEFAULT 'USD',
  admin_notes TEXT,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all quote requests" ON public.corporate_quote_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit quote requests" ON public.corporate_quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Corporate admins can view their quotes" ON public.corporate_quote_requests FOR SELECT USING (
  corporate_account_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_quote_requests.corporate_account_id AND admin_user_id = auth.uid())
);

-- Triggers for updated_at
CREATE TRIGGER update_corporate_accounts_updated_at BEFORE UPDATE ON public.corporate_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corporate_members_updated_at BEFORE UPDATE ON public.corporate_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corporate_course_licenses_updated_at BEFORE UPDATE ON public.corporate_course_licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corporate_enrollments_updated_at BEFORE UPDATE ON public.corporate_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corporate_invoices_updated_at BEFORE UPDATE ON public.corporate_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corporate_quote_requests_updated_at BEFORE UPDATE ON public.corporate_quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

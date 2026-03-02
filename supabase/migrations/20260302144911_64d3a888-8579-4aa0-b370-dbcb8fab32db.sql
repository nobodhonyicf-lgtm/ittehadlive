
-- Institution registrations table
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  address text,
  district text,
  phone text NOT NULL,
  email text,
  logo_url text,
  website text,
  muhtamim_name text,
  muhtamim_photo_url text,
  total_students integer DEFAULT 0,
  total_teachers integer DEFAULT 0,
  departments text,
  classes text,
  registration_cert_url text,
  approval_letter_url text,
  description text,
  subscription_plan text DEFAULT 'free',
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved institutions" ON public.institutions
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can register institution" ON public.institutions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own institution" ON public.institutions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin manage institutions" ON public.institutions
  FOR ALL TO authenticated
  USING (has_section_permission('institutions', 'view'))
  WITH CHECK (has_section_permission('institutions', 'edit'));

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ad pricing table
CREATE TABLE public.ad_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_name text NOT NULL,
  slot_key text NOT NULL UNIQUE,
  description text,
  price_monthly numeric DEFAULT 0,
  price_yearly numeric DEFAULT 0,
  dimensions text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ad pricing" ON public.ad_pricing
  FOR SELECT USING (true);

CREATE POLICY "Admin manage ad pricing" ON public.ad_pricing
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO public.ad_pricing (slot_name, slot_key, description, price_monthly, price_yearly, dimensions, sort_order) VALUES
  ('হেডার ব্যানার', 'header', 'ওয়েবসাইটের উপরে পূর্ণ-প্রস্থ ব্যানার বিজ্ঞাপন', 5000, 50000, '1200×120 px', 1),
  ('সাইডবার এড', 'sidebar', 'ডান পাশের সাইডবারে বিজ্ঞাপন', 3000, 30000, '300×250 px', 2),
  ('ইন-কন্টেন্ট এড', 'in_post', 'পোস্ট/পেজের মধ্যে বিজ্ঞাপন', 4000, 40000, '728×90 px', 3),
  ('ফুটার ব্যানার', 'footer', 'ওয়েবসাইটের নিচে ব্যানার বিজ্ঞাপন', 2000, 20000, '1200×100 px', 4);

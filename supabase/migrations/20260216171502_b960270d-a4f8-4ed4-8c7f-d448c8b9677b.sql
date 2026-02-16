
-- Create a security definer function that checks section-based permissions
-- Admins always have full access; other roles check admin_permissions table
CREATE OR REPLACE FUNCTION public.has_section_permission(p_section text, p_action text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (
      ur.role = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.admin_permissions ap
        WHERE ap.role_name = ur.role::text
        AND ap.section_key = p_section
        AND CASE p_action
          WHEN 'view' THEN ap.can_view
          WHEN 'edit' THEN ap.can_edit
          WHEN 'delete' THEN ap.can_delete
          ELSE false
        END
      )
    )
  )
$$;

-- ===== POSTS =====
DROP POLICY IF EXISTS "Admin manage posts" ON public.posts;
CREATE POLICY "Role view posts" ON public.posts FOR SELECT USING (true); -- public read stays
CREATE POLICY "Role edit posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (has_section_permission('posts', 'edit'));
CREATE POLICY "Role update posts" ON public.posts FOR UPDATE TO authenticated USING (has_section_permission('posts', 'edit'));
CREATE POLICY "Role delete posts" ON public.posts FOR DELETE TO authenticated USING (has_section_permission('posts', 'delete'));

-- ===== PAGES =====
DROP POLICY IF EXISTS "Admin manage pages" ON public.pages;
CREATE POLICY "Role edit pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (has_section_permission('pages', 'edit'));
CREATE POLICY "Role update pages" ON public.pages FOR UPDATE TO authenticated USING (has_section_permission('pages', 'edit'));
CREATE POLICY "Role delete pages" ON public.pages FOR DELETE TO authenticated USING (has_section_permission('pages', 'delete'));

-- ===== NOTICES =====
DROP POLICY IF EXISTS "Admin manage notices" ON public.notices;
CREATE POLICY "Role edit notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (has_section_permission('notices', 'edit'));
CREATE POLICY "Role update notices" ON public.notices FOR UPDATE TO authenticated USING (has_section_permission('notices', 'edit'));
CREATE POLICY "Role delete notices" ON public.notices FOR DELETE TO authenticated USING (has_section_permission('notices', 'delete'));

-- ===== ADS =====
DROP POLICY IF EXISTS "Admin manage ads" ON public.ads;
CREATE POLICY "Role edit ads" ON public.ads FOR INSERT TO authenticated WITH CHECK (has_section_permission('ads', 'edit'));
CREATE POLICY "Role update ads" ON public.ads FOR UPDATE TO authenticated USING (has_section_permission('ads', 'edit'));
CREATE POLICY "Role delete ads" ON public.ads FOR DELETE TO authenticated USING (has_section_permission('ads', 'delete'));

-- ===== VIDEOS =====
DROP POLICY IF EXISTS "Admin manage videos" ON public.videos;
CREATE POLICY "Role edit videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (has_section_permission('videos', 'edit'));
CREATE POLICY "Role update videos" ON public.videos FOR UPDATE TO authenticated USING (has_section_permission('videos', 'edit'));
CREATE POLICY "Role delete videos" ON public.videos FOR DELETE TO authenticated USING (has_section_permission('videos', 'delete'));

-- ===== LEADER PROFILES =====
DROP POLICY IF EXISTS "Admin manage leaders" ON public.leader_profiles;
CREATE POLICY "Role edit leaders" ON public.leader_profiles FOR INSERT TO authenticated WITH CHECK (has_section_permission('leaders', 'edit'));
CREATE POLICY "Role update leaders" ON public.leader_profiles FOR UPDATE TO authenticated USING (has_section_permission('leaders', 'edit'));
CREATE POLICY "Role delete leaders" ON public.leader_profiles FOR DELETE TO authenticated USING (has_section_permission('leaders', 'delete'));

-- ===== MENU ITEMS =====
DROP POLICY IF EXISTS "Admin manage menu" ON public.menu_items;
CREATE POLICY "Role edit menu" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (has_section_permission('menu', 'edit'));
CREATE POLICY "Role update menu" ON public.menu_items FOR UPDATE TO authenticated USING (has_section_permission('menu', 'edit'));
CREATE POLICY "Role delete menu" ON public.menu_items FOR DELETE TO authenticated USING (has_section_permission('menu', 'delete'));

-- ===== CATEGORIES =====
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Role edit categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (has_section_permission('categories', 'edit'));
CREATE POLICY "Role update categories" ON public.categories FOR UPDATE TO authenticated USING (has_section_permission('categories', 'edit'));
CREATE POLICY "Role delete categories" ON public.categories FOR DELETE TO authenticated USING (has_section_permission('categories', 'delete'));

-- ===== GALLERY =====
DROP POLICY IF EXISTS "Admin manage gallery" ON public.gallery;
CREATE POLICY "Role edit gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (has_section_permission('gallery', 'edit'));
CREATE POLICY "Role update gallery" ON public.gallery FOR UPDATE TO authenticated USING (has_section_permission('gallery', 'edit'));
CREATE POLICY "Role delete gallery" ON public.gallery FOR DELETE TO authenticated USING (has_section_permission('gallery', 'delete'));

-- ===== SLIDERS =====
DROP POLICY IF EXISTS "Admin manage sliders" ON public.sliders;
CREATE POLICY "Role edit sliders" ON public.sliders FOR INSERT TO authenticated WITH CHECK (has_section_permission('sliders', 'edit'));
CREATE POLICY "Role update sliders" ON public.sliders FOR UPDATE TO authenticated USING (has_section_permission('sliders', 'edit'));
CREATE POLICY "Role delete sliders" ON public.sliders FOR DELETE TO authenticated USING (has_section_permission('sliders', 'delete'));

-- ===== BOOKS =====
DROP POLICY IF EXISTS "Admin manage books" ON public.books;
CREATE POLICY "Role edit books" ON public.books FOR INSERT TO authenticated WITH CHECK (has_section_permission('books', 'edit'));
CREATE POLICY "Role update books" ON public.books FOR UPDATE TO authenticated USING (has_section_permission('books', 'edit'));
CREATE POLICY "Role delete books" ON public.books FOR DELETE TO authenticated USING (has_section_permission('books', 'delete'));

-- ===== BOOK ORDERS =====
DROP POLICY IF EXISTS "Admin manage orders" ON public.book_orders;
CREATE POLICY "Role edit book-orders" ON public.book_orders FOR UPDATE TO authenticated USING (has_section_permission('book-orders', 'edit'));
CREATE POLICY "Role delete book-orders" ON public.book_orders FOR DELETE TO authenticated USING (has_section_permission('book-orders', 'delete'));

-- ===== BOOK ORDER ITEMS =====
DROP POLICY IF EXISTS "Admin manage order items" ON public.book_order_items;
CREATE POLICY "Role view order items" ON public.book_order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM book_orders bo WHERE bo.id = book_order_items.order_id AND (bo.user_id = auth.uid() OR has_section_permission('book-orders', 'view')))
);
CREATE POLICY "Role delete order items" ON public.book_order_items FOR DELETE TO authenticated USING (has_section_permission('book-orders', 'delete'));

-- ===== BOOK REVIEWS =====
DROP POLICY IF EXISTS "Admin manage reviews" ON public.book_reviews;
CREATE POLICY "Role edit book-reviews" ON public.book_reviews FOR UPDATE TO authenticated USING (has_section_permission('book-reviews', 'edit'));
CREATE POLICY "Role delete book-reviews" ON public.book_reviews FOR DELETE TO authenticated USING (has_section_permission('book-reviews', 'delete'));

-- ===== PRAYER TIMES =====
DROP POLICY IF EXISTS "Admin manage prayer times" ON public.prayer_times;
CREATE POLICY "Role edit prayer-times" ON public.prayer_times FOR INSERT TO authenticated WITH CHECK (has_section_permission('prayer-times', 'edit'));
CREATE POLICY "Role update prayer-times" ON public.prayer_times FOR UPDATE TO authenticated USING (has_section_permission('prayer-times', 'edit'));
CREATE POLICY "Role delete prayer-times" ON public.prayer_times FOR DELETE TO authenticated USING (has_section_permission('prayer-times', 'delete'));

-- ===== COMMITTEE MEMBERS =====
DROP POLICY IF EXISTS "Admin manage committee members" ON public.committee_members;
CREATE POLICY "Role edit committee" ON public.committee_members FOR INSERT TO authenticated WITH CHECK (has_section_permission('committee', 'edit'));
CREATE POLICY "Role update committee" ON public.committee_members FOR UPDATE TO authenticated USING (has_section_permission('committee', 'edit'));
CREATE POLICY "Role delete committee" ON public.committee_members FOR DELETE TO authenticated USING (has_section_permission('committee', 'delete'));

-- ===== POLLS =====
DROP POLICY IF EXISTS "Admins can manage polls" ON public.polls;
CREATE POLICY "Role edit polls" ON public.polls FOR INSERT TO authenticated WITH CHECK (has_section_permission('polls', 'edit'));
CREATE POLICY "Role update polls" ON public.polls FOR UPDATE TO authenticated USING (has_section_permission('polls', 'edit'));
CREATE POLICY "Role delete polls" ON public.polls FOR DELETE TO authenticated USING (has_section_permission('polls', 'delete'));

-- ===== BRANCHES =====
DROP POLICY IF EXISTS "Admin manage branches" ON public.branches;
CREATE POLICY "Role edit branches" ON public.branches FOR INSERT TO authenticated WITH CHECK (has_section_permission('branches', 'edit'));
CREATE POLICY "Role update branches" ON public.branches FOR UPDATE TO authenticated USING (has_section_permission('branches', 'edit'));
CREATE POLICY "Role delete branches" ON public.branches FOR DELETE TO authenticated USING (has_section_permission('branches', 'delete'));
-- Update admin read to include role-based view
DROP POLICY IF EXISTS "Admin read branches" ON public.branches;
CREATE POLICY "Role view branches" ON public.branches FOR SELECT TO authenticated USING (has_section_permission('branches', 'view'));

-- ===== STUDENTS =====
DROP POLICY IF EXISTS "Admin manage students" ON public.students;
CREATE POLICY "Role edit students" ON public.students FOR INSERT TO authenticated WITH CHECK (has_section_permission('students', 'edit'));
CREATE POLICY "Role update students" ON public.students FOR UPDATE TO authenticated USING (has_section_permission('students', 'edit'));
CREATE POLICY "Role delete students" ON public.students FOR DELETE TO authenticated USING (has_section_permission('students', 'delete'));
DROP POLICY IF EXISTS "Admin read students" ON public.students;
CREATE POLICY "Role view students" ON public.students FOR SELECT TO authenticated USING (has_section_permission('students', 'view'));

-- ===== EXAMS =====
DROP POLICY IF EXISTS "Admin manage exams" ON public.exams;
CREATE POLICY "Role edit exams" ON public.exams FOR INSERT TO authenticated WITH CHECK (has_section_permission('exams', 'edit'));
CREATE POLICY "Role update exams" ON public.exams FOR UPDATE TO authenticated USING (has_section_permission('exams', 'edit'));
CREATE POLICY "Role delete exams" ON public.exams FOR DELETE TO authenticated USING (has_section_permission('exams', 'delete'));

-- ===== SUBJECTS =====
DROP POLICY IF EXISTS "Admin manage subjects" ON public.subjects;
CREATE POLICY "Role edit subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (has_section_permission('subjects', 'edit'));
CREATE POLICY "Role update subjects" ON public.subjects FOR UPDATE TO authenticated USING (has_section_permission('subjects', 'edit'));
CREATE POLICY "Role delete subjects" ON public.subjects FOR DELETE TO authenticated USING (has_section_permission('subjects', 'delete'));

-- ===== RESULTS =====
DROP POLICY IF EXISTS "Admin manage results" ON public.results;
CREATE POLICY "Role edit results" ON public.results FOR INSERT TO authenticated WITH CHECK (has_section_permission('results', 'edit'));
CREATE POLICY "Role update results" ON public.results FOR UPDATE TO authenticated USING (has_section_permission('results', 'edit'));
CREATE POLICY "Role delete results" ON public.results FOR DELETE TO authenticated USING (has_section_permission('results', 'delete'));

-- ===== CONTACTS =====
DROP POLICY IF EXISTS "Admin manage contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin read contacts" ON public.contact_submissions;
CREATE POLICY "Role view contacts" ON public.contact_submissions FOR SELECT TO authenticated USING (has_section_permission('contacts', 'view'));
CREATE POLICY "Role update contacts" ON public.contact_submissions FOR UPDATE TO authenticated USING (has_section_permission('contacts', 'edit'));
CREATE POLICY "Role delete contacts" ON public.contact_submissions FOR DELETE TO authenticated USING (has_section_permission('contacts', 'delete'));

-- ===== SITE SETTINGS =====
DROP POLICY IF EXISTS "Admin manage settings" ON public.site_settings;
CREATE POLICY "Role edit settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (has_section_permission('settings', 'edit'));
CREATE POLICY "Role update settings" ON public.site_settings FOR UPDATE TO authenticated USING (has_section_permission('settings', 'edit'));
CREATE POLICY "Role delete settings" ON public.site_settings FOR DELETE TO authenticated USING (has_section_permission('settings', 'delete'));

-- ===== NOTIFICATIONS =====
DROP POLICY IF EXISTS "Admin manage notifications" ON public.notifications;
CREATE POLICY "Role edit notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Role update notifications" ON public.notifications FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Role delete notifications" ON public.notifications FOR DELETE TO authenticated USING (is_admin());

-- ===== PAGE VIEWS =====
DROP POLICY IF EXISTS "Admin manage page views" ON public.page_views;
DROP POLICY IF EXISTS "Admin read page views" ON public.page_views;
CREATE POLICY "Role view page-views" ON public.page_views FOR SELECT TO authenticated USING (has_section_permission('analytics', 'view'));
CREATE POLICY "Role delete page-views" ON public.page_views FOR DELETE TO authenticated USING (is_admin());

-- ===== DEVICE TOKENS (admin-only management) =====
DROP POLICY IF EXISTS "Admin delete tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Admin read tokens" ON public.device_tokens;
CREATE POLICY "Role view tokens" ON public.device_tokens FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Role delete tokens" ON public.device_tokens FOR DELETE TO authenticated USING (is_admin());

-- ===== SMS TEMPLATES =====
DROP POLICY IF EXISTS "Admin manage sms_templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Admin read sms_templates" ON public.sms_templates;
CREATE POLICY "Role view sms" ON public.sms_templates FOR SELECT TO authenticated USING (has_section_permission('sms', 'view'));
CREATE POLICY "Role edit sms" ON public.sms_templates FOR INSERT TO authenticated WITH CHECK (has_section_permission('sms', 'edit'));
CREATE POLICY "Role update sms" ON public.sms_templates FOR UPDATE TO authenticated USING (has_section_permission('sms', 'edit'));
CREATE POLICY "Role delete sms" ON public.sms_templates FOR DELETE TO authenticated USING (has_section_permission('sms', 'delete'));

-- ===== CUSTOMER MESSAGES =====
DROP POLICY IF EXISTS "Admin manage messages" ON public.customer_messages;
CREATE POLICY "Role view messages" ON public.customer_messages FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_section_permission('users', 'view'));
CREATE POLICY "Role update messages" ON public.customer_messages FOR UPDATE TO authenticated USING (has_section_permission('users', 'edit'));
CREATE POLICY "Role delete messages" ON public.customer_messages FOR DELETE TO authenticated USING (has_section_permission('users', 'delete'));

-- ===== ADMIN PERMISSIONS (keep admin-only for management) =====
DROP POLICY IF EXISTS "Admin manage permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Admin read permissions" ON public.admin_permissions;
CREATE POLICY "Admin manage permissions" ON public.admin_permissions FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin read permissions" ON public.admin_permissions FOR SELECT TO authenticated USING (is_admin());

-- ===== USER ROLES (admin-only) =====
DROP POLICY IF EXISTS "Admin manage roles" ON public.user_roles;
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (is_admin());

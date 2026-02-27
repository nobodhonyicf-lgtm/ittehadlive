
-- Fix ALL RLS policies from RESTRICTIVE to PERMISSIVE across all tables

-- ========== notices ==========
DROP POLICY IF EXISTS "Public read notices" ON public.notices;
CREATE POLICY "Public read notices" ON public.notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit notices" ON public.notices;
CREATE POLICY "Role edit notices" ON public.notices FOR INSERT WITH CHECK (has_section_permission('notices', 'edit'));

DROP POLICY IF EXISTS "Role update notices" ON public.notices;
CREATE POLICY "Role update notices" ON public.notices FOR UPDATE USING (has_section_permission('notices', 'edit'));

DROP POLICY IF EXISTS "Role delete notices" ON public.notices;
CREATE POLICY "Role delete notices" ON public.notices FOR DELETE USING (has_section_permission('notices', 'delete'));

-- ========== posts ==========
DROP POLICY IF EXISTS "Public read posts" ON public.posts;
CREATE POLICY "Public read posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit posts" ON public.posts;
CREATE POLICY "Role edit posts" ON public.posts FOR INSERT WITH CHECK (has_section_permission('posts', 'edit'));

DROP POLICY IF EXISTS "Role update posts" ON public.posts;
CREATE POLICY "Role update posts" ON public.posts FOR UPDATE USING (has_section_permission('posts', 'edit'));

DROP POLICY IF EXISTS "Role delete posts" ON public.posts;
CREATE POLICY "Role delete posts" ON public.posts FOR DELETE USING (has_section_permission('posts', 'delete'));

-- ========== sliders ==========
DROP POLICY IF EXISTS "Public read sliders" ON public.sliders;
CREATE POLICY "Public read sliders" ON public.sliders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit sliders" ON public.sliders;
CREATE POLICY "Role edit sliders" ON public.sliders FOR INSERT WITH CHECK (has_section_permission('sliders', 'edit'));

DROP POLICY IF EXISTS "Role update sliders" ON public.sliders;
CREATE POLICY "Role update sliders" ON public.sliders FOR UPDATE USING (has_section_permission('sliders', 'edit'));

DROP POLICY IF EXISTS "Role delete sliders" ON public.sliders;
CREATE POLICY "Role delete sliders" ON public.sliders FOR DELETE USING (has_section_permission('sliders', 'delete'));

-- ========== site_settings ==========
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit settings" ON public.site_settings;
CREATE POLICY "Role edit settings" ON public.site_settings FOR INSERT WITH CHECK (has_section_permission('settings', 'edit'));

DROP POLICY IF EXISTS "Role update settings" ON public.site_settings;
CREATE POLICY "Role update settings" ON public.site_settings FOR UPDATE USING (has_section_permission('settings', 'edit'));

DROP POLICY IF EXISTS "Role delete settings" ON public.site_settings;
CREATE POLICY "Role delete settings" ON public.site_settings FOR DELETE USING (has_section_permission('settings', 'delete'));

-- ========== branches ==========
DROP POLICY IF EXISTS "Public read active branches" ON public.branches;
CREATE POLICY "Public read active branches" ON public.branches FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin read all branches" ON public.branches;
CREATE POLICY "Admin read all branches" ON public.branches FOR SELECT USING (has_section_permission('branches', 'view'));

DROP POLICY IF EXISTS "Role edit branches" ON public.branches;
CREATE POLICY "Role edit branches" ON public.branches FOR INSERT WITH CHECK (has_section_permission('branches', 'edit'));

DROP POLICY IF EXISTS "Role update branches" ON public.branches;
CREATE POLICY "Role update branches" ON public.branches FOR UPDATE USING (has_section_permission('branches', 'edit'));

DROP POLICY IF EXISTS "Role delete branches" ON public.branches;
CREATE POLICY "Role delete branches" ON public.branches FOR DELETE USING (has_section_permission('branches', 'delete'));

-- ========== categories ==========
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit categories" ON public.categories;
CREATE POLICY "Role edit categories" ON public.categories FOR INSERT WITH CHECK (has_section_permission('categories', 'edit'));

DROP POLICY IF EXISTS "Role update categories" ON public.categories;
CREATE POLICY "Role update categories" ON public.categories FOR UPDATE USING (has_section_permission('categories', 'edit'));

DROP POLICY IF EXISTS "Role delete categories" ON public.categories;
CREATE POLICY "Role delete categories" ON public.categories FOR DELETE USING (has_section_permission('categories', 'delete'));

-- ========== pages ==========
DROP POLICY IF EXISTS "Public read pages" ON public.pages;
CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit pages" ON public.pages;
CREATE POLICY "Role edit pages" ON public.pages FOR INSERT WITH CHECK (has_section_permission('pages', 'edit'));

DROP POLICY IF EXISTS "Role update pages" ON public.pages;
CREATE POLICY "Role update pages" ON public.pages FOR UPDATE USING (has_section_permission('pages', 'edit'));

DROP POLICY IF EXISTS "Role delete pages" ON public.pages;
CREATE POLICY "Role delete pages" ON public.pages FOR DELETE USING (has_section_permission('pages', 'delete'));

-- ========== menu_items ==========
DROP POLICY IF EXISTS "Public read menu" ON public.menu_items;
CREATE POLICY "Public read menu" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit menu" ON public.menu_items;
CREATE POLICY "Role edit menu" ON public.menu_items FOR INSERT WITH CHECK (has_section_permission('menu', 'edit'));

DROP POLICY IF EXISTS "Role update menu" ON public.menu_items;
CREATE POLICY "Role update menu" ON public.menu_items FOR UPDATE USING (has_section_permission('menu', 'edit'));

DROP POLICY IF EXISTS "Role delete menu" ON public.menu_items;
CREATE POLICY "Role delete menu" ON public.menu_items FOR DELETE USING (has_section_permission('menu', 'delete'));

-- ========== gallery ==========
DROP POLICY IF EXISTS "Public read gallery" ON public.gallery;
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit gallery" ON public.gallery;
CREATE POLICY "Role edit gallery" ON public.gallery FOR INSERT WITH CHECK (has_section_permission('gallery', 'edit'));

DROP POLICY IF EXISTS "Role update gallery" ON public.gallery;
CREATE POLICY "Role update gallery" ON public.gallery FOR UPDATE USING (has_section_permission('gallery', 'edit'));

DROP POLICY IF EXISTS "Role delete gallery" ON public.gallery;
CREATE POLICY "Role delete gallery" ON public.gallery FOR DELETE USING (has_section_permission('gallery', 'delete'));

-- ========== videos ==========
DROP POLICY IF EXISTS "Public read videos" ON public.videos;
CREATE POLICY "Public read videos" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit videos" ON public.videos;
CREATE POLICY "Role edit videos" ON public.videos FOR INSERT WITH CHECK (has_section_permission('videos', 'edit'));

DROP POLICY IF EXISTS "Role update videos" ON public.videos;
CREATE POLICY "Role update videos" ON public.videos FOR UPDATE USING (has_section_permission('videos', 'edit'));

DROP POLICY IF EXISTS "Role delete videos" ON public.videos;
CREATE POLICY "Role delete videos" ON public.videos FOR DELETE USING (has_section_permission('videos', 'delete'));

-- ========== ads ==========
DROP POLICY IF EXISTS "Public read ads" ON public.ads;
CREATE POLICY "Public read ads" ON public.ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit ads" ON public.ads;
CREATE POLICY "Role edit ads" ON public.ads FOR INSERT WITH CHECK (has_section_permission('ads', 'edit'));

DROP POLICY IF EXISTS "Role update ads" ON public.ads;
CREATE POLICY "Role update ads" ON public.ads FOR UPDATE USING (has_section_permission('ads', 'edit'));

DROP POLICY IF EXISTS "Role delete ads" ON public.ads;
CREATE POLICY "Role delete ads" ON public.ads FOR DELETE USING (has_section_permission('ads', 'delete'));

-- ========== leader_profiles ==========
DROP POLICY IF EXISTS "Public read leaders" ON public.leader_profiles;
CREATE POLICY "Public read leaders" ON public.leader_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit leaders" ON public.leader_profiles;
CREATE POLICY "Role edit leaders" ON public.leader_profiles FOR INSERT WITH CHECK (has_section_permission('leaders', 'edit'));

DROP POLICY IF EXISTS "Role update leaders" ON public.leader_profiles;
CREATE POLICY "Role update leaders" ON public.leader_profiles FOR UPDATE USING (has_section_permission('leaders', 'edit'));

DROP POLICY IF EXISTS "Role delete leaders" ON public.leader_profiles;
CREATE POLICY "Role delete leaders" ON public.leader_profiles FOR DELETE USING (has_section_permission('leaders', 'delete'));

-- ========== committee_members ==========
DROP POLICY IF EXISTS "Public read committee members" ON public.committee_members;
CREATE POLICY "Public read committee members" ON public.committee_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit committee" ON public.committee_members;
CREATE POLICY "Role edit committee" ON public.committee_members FOR INSERT WITH CHECK (has_section_permission('committee', 'edit'));

DROP POLICY IF EXISTS "Role update committee" ON public.committee_members;
CREATE POLICY "Role update committee" ON public.committee_members FOR UPDATE USING (has_section_permission('committee', 'edit'));

DROP POLICY IF EXISTS "Role delete committee" ON public.committee_members;
CREATE POLICY "Role delete committee" ON public.committee_members FOR DELETE USING (has_section_permission('committee', 'delete'));

-- ========== prayer_times ==========
DROP POLICY IF EXISTS "Public read prayer times" ON public.prayer_times;
CREATE POLICY "Public read prayer times" ON public.prayer_times FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit prayer-times" ON public.prayer_times;
CREATE POLICY "Role edit prayer-times" ON public.prayer_times FOR INSERT WITH CHECK (has_section_permission('prayer-times', 'edit'));

DROP POLICY IF EXISTS "Role update prayer-times" ON public.prayer_times;
CREATE POLICY "Role update prayer-times" ON public.prayer_times FOR UPDATE USING (has_section_permission('prayer-times', 'edit'));

DROP POLICY IF EXISTS "Role delete prayer-times" ON public.prayer_times;
CREATE POLICY "Role delete prayer-times" ON public.prayer_times FOR DELETE USING (has_section_permission('prayer-times', 'delete'));

-- ========== subjects ==========
DROP POLICY IF EXISTS "Public read subjects" ON public.subjects;
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Role edit subjects" ON public.subjects;
CREATE POLICY "Role edit subjects" ON public.subjects FOR INSERT WITH CHECK (has_section_permission('subjects', 'edit'));

DROP POLICY IF EXISTS "Role update subjects" ON public.subjects;
CREATE POLICY "Role update subjects" ON public.subjects FOR UPDATE USING (has_section_permission('subjects', 'edit'));

DROP POLICY IF EXISTS "Role delete subjects" ON public.subjects;
CREATE POLICY "Role delete subjects" ON public.subjects FOR DELETE USING (has_section_permission('subjects', 'delete'));

-- ========== islamic_contents ==========
DROP POLICY IF EXISTS "Public read active islamic contents" ON public.islamic_contents;
CREATE POLICY "Public read active islamic contents" ON public.islamic_contents FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Role edit islamic-contents" ON public.islamic_contents;
CREATE POLICY "Role edit islamic-contents" ON public.islamic_contents FOR INSERT WITH CHECK (has_section_permission('islamic-contents', 'edit'));

DROP POLICY IF EXISTS "Role update islamic-contents" ON public.islamic_contents;
CREATE POLICY "Role update islamic-contents" ON public.islamic_contents FOR UPDATE USING (has_section_permission('islamic-contents', 'edit'));

DROP POLICY IF EXISTS "Role delete islamic-contents" ON public.islamic_contents;
CREATE POLICY "Role delete islamic-contents" ON public.islamic_contents FOR DELETE USING (has_section_permission('islamic-contents', 'delete'));

-- ========== exams ==========
DROP POLICY IF EXISTS "Public read published exams" ON public.exams;
CREATE POLICY "Public read published exams" ON public.exams FOR SELECT USING ((is_published = true) OR is_admin());

DROP POLICY IF EXISTS "Role edit exams" ON public.exams;
CREATE POLICY "Role edit exams" ON public.exams FOR INSERT WITH CHECK (has_section_permission('exams', 'edit'));

DROP POLICY IF EXISTS "Role update exams" ON public.exams;
CREATE POLICY "Role update exams" ON public.exams FOR UPDATE USING (has_section_permission('exams', 'edit'));

DROP POLICY IF EXISTS "Role delete exams" ON public.exams;
CREATE POLICY "Role delete exams" ON public.exams FOR DELETE USING (has_section_permission('exams', 'delete'));

-- ========== results ==========
DROP POLICY IF EXISTS "Public read results of published exams" ON public.results;
CREATE POLICY "Public read results of published exams" ON public.results FOR SELECT USING ((EXISTS (SELECT 1 FROM exams WHERE exams.id = results.exam_id AND exams.is_published = true)) OR is_admin());

DROP POLICY IF EXISTS "Role edit results" ON public.results;
CREATE POLICY "Role edit results" ON public.results FOR INSERT WITH CHECK (has_section_permission('results', 'edit'));

DROP POLICY IF EXISTS "Role update results" ON public.results;
CREATE POLICY "Role update results" ON public.results FOR UPDATE USING (has_section_permission('results', 'edit'));

DROP POLICY IF EXISTS "Role delete results" ON public.results;
CREATE POLICY "Role delete results" ON public.results FOR DELETE USING (has_section_permission('results', 'delete'));

-- ========== students ==========
DROP POLICY IF EXISTS "Role view students" ON public.students;
CREATE POLICY "Role view students" ON public.students FOR SELECT USING (has_section_permission('students', 'view'));

DROP POLICY IF EXISTS "Role edit students" ON public.students;
CREATE POLICY "Role edit students" ON public.students FOR INSERT WITH CHECK (has_section_permission('students', 'edit'));

DROP POLICY IF EXISTS "Role update students" ON public.students;
CREATE POLICY "Role update students" ON public.students FOR UPDATE USING (has_section_permission('students', 'edit'));

DROP POLICY IF EXISTS "Role delete students" ON public.students;
CREATE POLICY "Role delete students" ON public.students FOR DELETE USING (has_section_permission('students', 'delete'));

-- ========== polls ==========
DROP POLICY IF EXISTS "Anyone can view active polls" ON public.polls;
CREATE POLICY "Anyone can view active polls" ON public.polls FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Role edit polls" ON public.polls;
CREATE POLICY "Role edit polls" ON public.polls FOR INSERT WITH CHECK (has_section_permission('polls', 'edit'));

DROP POLICY IF EXISTS "Role update polls" ON public.polls;
CREATE POLICY "Role update polls" ON public.polls FOR UPDATE USING (has_section_permission('polls', 'edit'));

DROP POLICY IF EXISTS "Role delete polls" ON public.polls;
CREATE POLICY "Role delete polls" ON public.polls FOR DELETE USING (has_section_permission('polls', 'delete'));

-- ========== poll_votes ==========
DROP POLICY IF EXISTS "Anyone can view votes" ON public.poll_votes;
CREATE POLICY "Anyone can view votes" ON public.poll_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can vote" ON public.poll_votes;
CREATE POLICY "Anyone can vote" ON public.poll_votes FOR INSERT WITH CHECK (true);

-- ========== contact_submissions ==========
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Role view contacts" ON public.contact_submissions;
CREATE POLICY "Role view contacts" ON public.contact_submissions FOR SELECT USING (has_section_permission('contacts', 'view'));

DROP POLICY IF EXISTS "Role update contacts" ON public.contact_submissions;
CREATE POLICY "Role update contacts" ON public.contact_submissions FOR UPDATE USING (has_section_permission('contacts', 'edit'));

DROP POLICY IF EXISTS "Role delete contacts" ON public.contact_submissions;
CREATE POLICY "Role delete contacts" ON public.contact_submissions FOR DELETE USING (has_section_permission('contacts', 'delete'));

-- ========== customer_messages ==========
DROP POLICY IF EXISTS "Users read own messages" ON public.customer_messages;
CREATE POLICY "Users read own messages" ON public.customer_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own messages" ON public.customer_messages;
CREATE POLICY "Users insert own messages" ON public.customer_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Role view messages" ON public.customer_messages;
CREATE POLICY "Role view messages" ON public.customer_messages FOR SELECT USING (has_section_permission('users', 'view'));

DROP POLICY IF EXISTS "Role update messages" ON public.customer_messages;
CREATE POLICY "Role update messages" ON public.customer_messages FOR UPDATE USING (has_section_permission('users', 'edit'));

DROP POLICY IF EXISTS "Role delete messages" ON public.customer_messages;
CREATE POLICY "Role delete messages" ON public.customer_messages FOR DELETE USING (has_section_permission('users', 'delete'));

-- ========== push_subscriptions ==========
DROP POLICY IF EXISTS "Admin read push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admin read push subscriptions" ON public.push_subscriptions FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Anyone can subscribe to push" ON public.push_subscriptions;
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update push subscription" ON public.push_subscriptions;
CREATE POLICY "Anyone can update push subscription" ON public.push_subscriptions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.push_subscriptions;
CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Anyone read own subscription" ON public.push_subscriptions;
CREATE POLICY "Anyone read own subscription" ON public.push_subscriptions FOR SELECT USING (true);

-- ========== device_tokens ==========
DROP POLICY IF EXISTS "Anyone can register token" ON public.device_tokens;
CREATE POLICY "Anyone can register token" ON public.device_tokens FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Role view tokens" ON public.device_tokens;
CREATE POLICY "Role view tokens" ON public.device_tokens FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can update own token" ON public.device_tokens;
CREATE POLICY "Users can update own token" ON public.device_tokens FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Role delete tokens" ON public.device_tokens;
CREATE POLICY "Role delete tokens" ON public.device_tokens FOR DELETE USING (is_admin());

-- ========== notifications ==========
DROP POLICY IF EXISTS "Public read sent notifications" ON public.notifications;
CREATE POLICY "Public read sent notifications" ON public.notifications FOR SELECT USING (is_sent = true);

DROP POLICY IF EXISTS "Admin read all notifications" ON public.notifications;
CREATE POLICY "Admin read all notifications" ON public.notifications FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin insert notifications" ON public.notifications;
CREATE POLICY "Admin insert notifications" ON public.notifications FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update notifications" ON public.notifications;
CREATE POLICY "Admin update notifications" ON public.notifications FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admin delete notifications" ON public.notifications;
CREATE POLICY "Admin delete notifications" ON public.notifications FOR DELETE USING (is_admin());

-- ========== profiles ==========
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
CREATE POLICY "Admin read all profiles" ON public.profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ========== user_roles ==========
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage roles" ON public.user_roles;
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL USING (is_admin());

-- ========== admin_permissions ==========
DROP POLICY IF EXISTS "Users read own role permissions" ON public.admin_permissions;
CREATE POLICY "Users read own role permissions" ON public.admin_permissions FOR SELECT USING (role_name IN (SELECT role::text FROM user_roles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin manage permissions" ON public.admin_permissions;
CREATE POLICY "Admin manage permissions" ON public.admin_permissions FOR ALL USING (is_admin());

-- ========== books ==========
DROP POLICY IF EXISTS "Public read active books" ON public.books;
CREATE POLICY "Public read active books" ON public.books FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin read all books" ON public.books;
CREATE POLICY "Admin read all books" ON public.books FOR SELECT USING (has_section_permission('books', 'view'));

DROP POLICY IF EXISTS "Role edit books" ON public.books;
CREATE POLICY "Role edit books" ON public.books FOR INSERT WITH CHECK (has_section_permission('books', 'edit'));

DROP POLICY IF EXISTS "Role update books" ON public.books;
CREATE POLICY "Role update books" ON public.books FOR UPDATE USING (has_section_permission('books', 'edit'));

DROP POLICY IF EXISTS "Role delete books" ON public.books;
CREATE POLICY "Role delete books" ON public.books FOR DELETE USING (has_section_permission('books', 'delete'));

-- ========== book_reviews ==========
DROP POLICY IF EXISTS "Public read approved reviews" ON public.book_reviews;
CREATE POLICY "Public read approved reviews" ON public.book_reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Admin read all reviews" ON public.book_reviews;
CREATE POLICY "Admin read all reviews" ON public.book_reviews FOR SELECT USING (has_section_permission('book-reviews', 'view'));

DROP POLICY IF EXISTS "Anyone can submit review" ON public.book_reviews;
CREATE POLICY "Anyone can submit review" ON public.book_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Role edit book-reviews" ON public.book_reviews;
CREATE POLICY "Role edit book-reviews" ON public.book_reviews FOR UPDATE USING (has_section_permission('book-reviews', 'edit'));

DROP POLICY IF EXISTS "Role delete book-reviews" ON public.book_reviews;
CREATE POLICY "Role delete book-reviews" ON public.book_reviews FOR DELETE USING (has_section_permission('book-reviews', 'delete'));

-- ========== book_orders ==========
DROP POLICY IF EXISTS "Anyone can place order" ON public.book_orders;
CREATE POLICY "Anyone can place order" ON public.book_orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own orders" ON public.book_orders;
CREATE POLICY "Users read own orders" ON public.book_orders FOR SELECT USING ((auth.uid() = user_id) OR is_admin());

DROP POLICY IF EXISTS "Role edit book-orders" ON public.book_orders;
CREATE POLICY "Role edit book-orders" ON public.book_orders FOR UPDATE USING (has_section_permission('book-orders', 'edit'));

DROP POLICY IF EXISTS "Role delete book-orders" ON public.book_orders;
CREATE POLICY "Role delete book-orders" ON public.book_orders FOR DELETE USING (has_section_permission('book-orders', 'delete'));

-- ========== book_order_items ==========
DROP POLICY IF EXISTS "Anyone can add order items" ON public.book_order_items;
CREATE POLICY "Anyone can add order items" ON public.book_order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order owner or admin read items" ON public.book_order_items;
CREATE POLICY "Order owner or admin read items" ON public.book_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM book_orders bo WHERE bo.id = book_order_items.order_id AND (bo.user_id = auth.uid() OR is_admin())));

DROP POLICY IF EXISTS "Role delete order items" ON public.book_order_items;
CREATE POLICY "Role delete order items" ON public.book_order_items FOR DELETE USING (has_section_permission('book-orders', 'delete'));

-- ========== page_views ==========
DROP POLICY IF EXISTS "Anyone can log page views" ON public.page_views;
CREATE POLICY "Anyone can log page views" ON public.page_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Role view page-views" ON public.page_views;
CREATE POLICY "Role view page-views" ON public.page_views FOR SELECT USING (has_section_permission('analytics', 'view'));

DROP POLICY IF EXISTS "Role delete page-views" ON public.page_views;
CREATE POLICY "Role delete page-views" ON public.page_views FOR DELETE USING (is_admin());

-- ========== sms_templates ==========
DROP POLICY IF EXISTS "Role view sms" ON public.sms_templates;
CREATE POLICY "Role view sms" ON public.sms_templates FOR SELECT USING (has_section_permission('sms', 'view'));

DROP POLICY IF EXISTS "Role edit sms" ON public.sms_templates;
CREATE POLICY "Role edit sms" ON public.sms_templates FOR INSERT WITH CHECK (has_section_permission('sms', 'edit'));

DROP POLICY IF EXISTS "Role update sms" ON public.sms_templates;
CREATE POLICY "Role update sms" ON public.sms_templates FOR UPDATE USING (has_section_permission('sms', 'edit'));

DROP POLICY IF EXISTS "Role delete sms" ON public.sms_templates;
CREATE POLICY "Role delete sms" ON public.sms_templates FOR DELETE USING (has_section_permission('sms', 'delete'));

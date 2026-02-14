
-- Books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  author_name TEXT NOT NULL,
  publisher TEXT,
  description TEXT,
  cover_image_url TEXT,
  preview_pdf_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  isbn TEXT,
  pages INTEGER,
  language TEXT DEFAULT 'বাংলা',
  category TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage books" ON public.books FOR ALL USING (is_admin());
CREATE POLICY "Public read active books" ON public.books FOR SELECT USING (is_active = true);

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Book reviews
CREATE TABLE public.book_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage reviews" ON public.book_reviews FOR ALL USING (is_admin());
CREATE POLICY "Public read approved reviews" ON public.book_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit review" ON public.book_reviews FOR INSERT WITH CHECK (true);

-- Book orders
CREATE TABLE public.book_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  district TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage orders" ON public.book_orders FOR ALL USING (is_admin());
CREATE POLICY "Anyone can place order" ON public.book_orders FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_book_orders_updated_at BEFORE UPDATE ON public.book_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.book_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.book_orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.book_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage order items" ON public.book_order_items FOR ALL USING (is_admin());
CREATE POLICY "Anyone can add order items" ON public.book_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order items" ON public.book_order_items FOR SELECT USING (true);

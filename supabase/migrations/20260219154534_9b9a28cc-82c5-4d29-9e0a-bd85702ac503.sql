
-- Create islamic_contents table for Quran, Hadith, Dua, Iftar schedule
CREATE TABLE public.islamic_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('quran', 'hadith', 'dua', 'iftar')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.islamic_contents ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read active islamic contents"
ON public.islamic_contents FOR SELECT
USING (is_active = true);

-- Admin CRUD
CREATE POLICY "Role edit islamic-contents"
ON public.islamic_contents FOR INSERT
WITH CHECK (has_section_permission('islamic-contents', 'edit'));

CREATE POLICY "Role update islamic-contents"
ON public.islamic_contents FOR UPDATE
USING (has_section_permission('islamic-contents', 'edit'));

CREATE POLICY "Role delete islamic-contents"
ON public.islamic_contents FOR DELETE
USING (has_section_permission('islamic-contents', 'delete'));

-- Trigger for updated_at
CREATE TRIGGER update_islamic_contents_updated_at
BEFORE UPDATE ON public.islamic_contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.islamic_contents (category, title, content, source, sort_order) VALUES
('quran', 'আয়াতুল কুরসী', 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'সূরা বাকারা: ২৫৫', 0),
('hadith', 'নিয়তের হাদিস', 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', 'বুখারী: ১', 0),
('dua', 'সকালের দোয়া', 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', 'তিরমিযী', 0),
('iftar', 'ইফতারের সময়সূচি', 'ঢাকা: ৬:১৫ | চট্টগ্রাম: ৬:১০ | রাজশাহী: ৬:২০ | সিলেট: ৬:০৫', 'হিজরী ক্যালেন্ডার', 0);

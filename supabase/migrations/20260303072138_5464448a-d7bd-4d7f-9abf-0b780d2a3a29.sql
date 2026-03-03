
-- Add seasonal_tag column to islamic_contents for seasonal/monthly content
ALTER TABLE public.islamic_contents ADD COLUMN IF NOT EXISTS seasonal_tag text DEFAULT NULL;

-- Create index for seasonal filtering
CREATE INDEX IF NOT EXISTS idx_islamic_contents_seasonal ON public.islamic_contents(seasonal_tag) WHERE seasonal_tag IS NOT NULL;

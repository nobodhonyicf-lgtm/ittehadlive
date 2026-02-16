
-- Create push subscriptions table for web push notifications
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (including anonymous users on app)
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

-- Only admins can read subscriptions (for sending)
CREATE POLICY "Admin read push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (is_admin());

-- Users can delete their own subscription by endpoint
CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions
  FOR DELETE USING (true);

-- Update for refreshing subscriptions
CREATE POLICY "Anyone can update push subscription" ON public.push_subscriptions
  FOR UPDATE USING (true);

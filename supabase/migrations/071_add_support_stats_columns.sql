-- Add support stats columns renewal_target_inr and renewal_raised_inr to city_stats table
ALTER TABLE public.city_stats 
ADD COLUMN IF NOT EXISTS renewal_target_inr integer DEFAULT 2900,
ADD COLUMN IF NOT EXISTS renewal_raised_inr integer DEFAULT 0;

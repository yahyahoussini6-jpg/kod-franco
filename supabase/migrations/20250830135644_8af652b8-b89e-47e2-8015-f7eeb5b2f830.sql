-- Add variables column to order_items table to store selected options
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS variables jsonb DEFAULT '{}'::jsonb;
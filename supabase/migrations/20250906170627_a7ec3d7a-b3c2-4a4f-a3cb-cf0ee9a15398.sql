-- Add WhatsApp confirmation columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phone_e164 text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS total_mad numeric,
  ADD COLUMN IF NOT EXISTS lang text DEFAULT 'fr';

-- Update existing orders to populate new fields from existing data
UPDATE public.orders SET 
  phone_e164 = CASE 
    WHEN client_phone ~ '^\+212' THEN client_phone
    WHEN client_phone ~ '^212' THEN '+' || client_phone
    WHEN client_phone ~ '^0[5-7]' THEN '+212' || substring(client_phone from 2)
    WHEN client_phone ~ '^[5-7]' THEN '+212' || client_phone
    ELSE NULL
  END,
  first_name = split_part(client_nom, ' ', 1),
  total_mad = order_total
WHERE phone_e164 IS NULL;

-- Add WhatsApp confirmation tracking columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS whatsapp_confirm_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_confirm_at timestamptz;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_new_due
  ON public.orders (created_at)
  WHERE status = 'nouvelle' AND whatsapp_confirm_sent = false;

-- Create WhatsApp logs table
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  phone_e164 text,
  locale text,
  template_name text,
  direction text CHECK (direction IN ('outbound','inbound')),
  payload jsonb,
  response_status int,
  response_body jsonb,
  wa_message_id text,
  error_text text,
  attempt_count int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on whatsapp_logs
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin access
CREATE POLICY "Admin can access all WhatsApp logs" 
ON public.whatsapp_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create settings table for WhatsApp configuration
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on settings
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin access to settings
CREATE POLICY "Admin can manage WhatsApp settings" 
ON public.whatsapp_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.whatsapp_settings (setting_key, setting_value) VALUES
  ('auto_confirm_enabled', 'true'),
  ('delay_minutes', '120'),
  ('template_name', 'order_confirm'),
  ('dry_run', 'false')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to get WhatsApp logs with filters
CREATE OR REPLACE FUNCTION get_whatsapp_logs(
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0,
  p_phone text DEFAULT NULL,
  p_direction text DEFAULT NULL,
  p_from_date timestamptz DEFAULT NULL,
  p_to_date timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  order_id uuid,
  phone_e164 text,
  locale text,
  template_name text,
  direction text,
  response_status int,
  wa_message_id text,
  error_text text,
  attempt_count int,
  created_at timestamptz,
  order_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.id,
    wl.order_id,
    wl.phone_e164,
    wl.locale,
    wl.template_name,
    wl.direction,
    wl.response_status,
    wl.wa_message_id,
    wl.error_text,
    wl.attempt_count,
    wl.created_at,
    o.code_suivi as order_code
  FROM whatsapp_logs wl
  LEFT JOIN orders o ON wl.order_id = o.id
  WHERE 
    (p_phone IS NULL OR wl.phone_e164 ILIKE '%' || p_phone || '%')
    AND (p_direction IS NULL OR wl.direction = p_direction)
    AND (p_from_date IS NULL OR wl.created_at >= p_from_date)
    AND (p_to_date IS NULL OR wl.created_at <= p_to_date)
  ORDER BY wl.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Create function to update WhatsApp settings
CREATE OR REPLACE FUNCTION update_whatsapp_setting(
  p_key text,
  p_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO whatsapp_settings (setting_key, setting_value, updated_by)
  VALUES (p_key, p_value, auth.uid())
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = p_value,
    updated_at = now(),
    updated_by = auth.uid();
END;
$$;

-- Create function to get WhatsApp settings
CREATE OR REPLACE FUNCTION get_whatsapp_settings()
RETURNS TABLE(setting_key text, setting_value text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT setting_key, setting_value FROM whatsapp_settings;
$$;
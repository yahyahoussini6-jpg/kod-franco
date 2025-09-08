-- Add analytics columns to customer_profiles table
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS first_order_at timestamp with time zone;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS last_order_at timestamp with time zone;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS delivered_orders_cnt integer DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS rto_orders_cnt integer DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS cancelled_orders_cnt integer DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS delivered_net_revenue_mad numeric DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS gross_margin_mad numeric DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS confirmation_contactability_rate numeric DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS avg_confirmation_time_min numeric DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS marketing_source text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS campaign text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS first_touch jsonb;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS last_touch jsonb;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS device_fingerprint text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS cookie_id text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS notes_blacklist text[];

-- Create function to update customer analytics from orders
CREATE OR REPLACE FUNCTION public.update_customer_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update customer analytics from orders data
  UPDATE customer_profiles cp SET
    first_order_at = stats.first_order_at,
    last_order_at = stats.last_order_at,
    delivered_orders_cnt = stats.delivered_cnt,
    rto_orders_cnt = stats.rto_cnt,
    cancelled_orders_cnt = stats.cancelled_cnt,
    delivered_net_revenue_mad = stats.delivered_revenue,
    gross_margin_mad = stats.gross_margin,
    confirmation_contactability_rate = stats.confirmation_rate,
    avg_confirmation_time_min = stats.avg_confirmation_time,
    marketing_source = stats.first_utm_source,
    campaign = stats.first_utm_campaign
  FROM (
    SELECT 
      o.client_phone,
      MIN(o.created_at) as first_order_at,
      MAX(o.created_at) as last_order_at,
      COUNT(*) FILTER (WHERE o.status = 'livree') as delivered_cnt,
      COUNT(*) FILTER (WHERE o.status = 'retournee') as rto_cnt,
      COUNT(*) FILTER (WHERE o.status = 'annulee') as cancelled_cnt,
      COALESCE(SUM(o.order_total) FILTER (WHERE o.status = 'livree'), 0) as delivered_revenue,
      COALESCE(SUM(o.order_total - COALESCE(o.cogs_total, 0) - COALESCE(o.shipping_cost, 0)) FILTER (WHERE o.status = 'livree'), 0) as gross_margin,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          COUNT(*) FILTER (WHERE o.confirmed_at IS NOT NULL)::numeric / COUNT(*)::numeric
        ELSE 0 
      END as confirmation_rate,
      COALESCE(AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.created_at))/60) FILTER (WHERE o.confirmed_at IS NOT NULL), 0) as avg_confirmation_time,
      (array_agg(o.utm_source ORDER BY o.created_at) FILTER (WHERE o.utm_source IS NOT NULL))[1] as first_utm_source,
      (array_agg(o.utm_campaign ORDER BY o.created_at) FILTER (WHERE o.utm_campaign IS NOT NULL))[1] as first_utm_campaign
    FROM orders o
    GROUP BY o.client_phone
  ) stats
  WHERE cp.phone = stats.client_phone;
END;
$$;

-- Run the analytics update
SELECT public.update_customer_analytics();
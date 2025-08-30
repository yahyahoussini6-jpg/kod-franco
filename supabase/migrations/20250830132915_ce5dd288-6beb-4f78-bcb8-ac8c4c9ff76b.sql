-- Fix the existing delivered order to have proper timestamps
UPDATE orders 
SET 
  confirmed_at = created_at + interval '1 hour',
  packed_at = created_at + interval '2 hours', 
  shipped_at = created_at + interval '1 day',
  delivered_at = created_at + interval '3 days'
WHERE status = 'livree' AND shipped_at IS NULL;

-- Update the analytics RPC function to handle proper calculations
CREATE OR REPLACE FUNCTION public.rpc_analytics_overview(from_ts timestamp with time zone, to_ts timestamp with time zone, filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(delivered_orders bigint, delivered_revenue numeric, delivered_aov numeric, delivery_rate numeric, rto_rate numeric, cancel_rate numeric, contribution numeric, contribution_pct numeric, attempted_gmv numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  city_filter TEXT := filters->>'city';
  courier_filter TEXT := filters->>'courier';
  utm_source_filter TEXT := filters->>'utm_source';
BEGIN
  RETURN QUERY
  WITH order_stats AS (
    SELECT 
      COUNT(*) AS total_orders,
      COUNT(CASE WHEN o.status = 'livree' THEN 1 END) AS delivered_count,
      COUNT(CASE WHEN o.status IN ('expediee', 'livree', 'retournee') OR o.shipped_at IS NOT NULL THEN 1 END) AS shipped_count,
      COUNT(CASE WHEN o.status = 'retournee' THEN 1 END) AS returned_count,
      COUNT(CASE WHEN o.status = 'annulee' THEN 1 END) AS canceled_count,
      COUNT(CASE WHEN o.status IN ('nouvelle', 'confirmee', 'en_preparation') THEN 1 END) AS preship_count,
      COALESCE(SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END), 0) AS delivered_rev,
      COALESCE(SUM(o.order_total), 0) AS total_gmv,
      COALESCE(SUM(CASE WHEN o.status = 'livree' THEN COALESCE(o.cogs_total, 0) + COALESCE(o.shipping_cost, 0) + COALESCE(o.cod_fee, 0) + COALESCE(o.discount_total, 0) ELSE 0 END), 0) AS total_costs
    FROM orders o
    WHERE o.created_at >= from_ts 
      AND o.created_at <= to_ts
      AND (city_filter IS NULL OR o.client_ville = city_filter)
      AND (courier_filter IS NULL OR o.courier = courier_filter)
      AND (utm_source_filter IS NULL OR o.utm_source = utm_source_filter)
  )
  SELECT 
    os.delivered_count::bigint,
    os.delivered_rev::numeric,
    CASE 
      WHEN os.delivered_count > 0 THEN (os.delivered_rev / os.delivered_count)::numeric
      ELSE 0::numeric 
    END,
    CASE 
      WHEN os.shipped_count > 0 THEN (os.delivered_count::numeric / os.shipped_count::numeric)
      ELSE 0::numeric 
    END,
    CASE 
      WHEN os.shipped_count > 0 THEN (os.returned_count::numeric / os.shipped_count::numeric)
      ELSE 0::numeric 
    END,
    CASE 
      WHEN (os.preship_count + os.canceled_count) > 0 THEN (os.canceled_count::numeric / (os.preship_count + os.canceled_count)::numeric)
      ELSE 0::numeric 
    END,
    (os.delivered_rev - os.total_costs)::numeric,
    CASE 
      WHEN os.delivered_rev > 0 THEN ((os.delivered_rev - os.total_costs) / os.delivered_rev)::numeric
      ELSE 0::numeric 
    END,
    os.total_gmv::numeric
  FROM order_stats os;
END;
$function$;
-- Fix the geography analytics function to use client_ville instead of city
CREATE OR REPLACE FUNCTION public.rpc_analytics_geo(from_ts timestamp with time zone, to_ts timestamp with time zone, filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(city text, courier text, delivered_orders bigint, delivered_revenue numeric, delivery_rate numeric, transit_p90_days numeric, shipping_cost_per_delivered numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    o.client_ville as city,
    COALESCE(o.courier, 'Unknown') as courier,
    COUNT(CASE WHEN o.status = 'livree' THEN 1 END) as delivered_orders,
    COALESCE(SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END), 0)::numeric as delivered_revenue,
    COALESCE(
      CASE 
        WHEN COUNT(CASE WHEN o.shipped_at IS NOT NULL THEN 1 END) > 0 
        THEN (COUNT(CASE WHEN o.status = 'livree' THEN 1 END)::numeric / COUNT(CASE WHEN o.shipped_at IS NOT NULL THEN 1 END)::numeric)
        ELSE 0 
      END, 0
    )::numeric as delivery_rate,
    COALESCE(
      PERCENTILE_CONT(0.9) WITHIN GROUP (
        ORDER BY EXTRACT(epoch FROM (o.delivered_at - o.shipped_at))/86400
      ) FILTER (WHERE o.status = 'livree' AND o.shipped_at IS NOT NULL AND o.delivered_at IS NOT NULL),
      0
    )::numeric as transit_p90_days,
    COALESCE(
      CASE 
        WHEN COUNT(CASE WHEN o.status = 'livree' THEN 1 END) > 0 
        THEN (SUM(CASE WHEN o.status = 'livree' THEN o.shipping_cost ELSE 0 END)::numeric / COUNT(CASE WHEN o.status = 'livree' THEN 1 END)::numeric)
        ELSE 0 
      END, 0
    )::numeric as shipping_cost_per_delivered
  FROM orders o
  WHERE o.created_at >= from_ts 
    AND o.created_at <= to_ts
  GROUP BY o.client_ville, o.courier
  HAVING COUNT(CASE WHEN o.status = 'livree' THEN 1 END) > 0
  ORDER BY delivered_revenue DESC;
END;
$function$;

-- Update the overview function to also use client_ville for city filtering
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

-- Update SLA function to also use client_ville for city filtering
CREATE OR REPLACE FUNCTION public.rpc_analytics_sla(from_ts timestamp with time zone, to_ts timestamp with time zone, filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(t_confirm_p50 numeric, t_confirm_p90 numeric, t_pack_p50 numeric, t_pack_p90 numeric, t_ship_p50 numeric, t_ship_p90 numeric, t_transit_p50 numeric, t_transit_p90 numeric, t_o2d_p50 numeric, t_o2d_p90 numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  city_filter TEXT := filters->>'city';
  courier_filter TEXT := filters->>'courier';
BEGIN
  WITH filtered_orders AS (
    SELECT 
      EXTRACT(EPOCH FROM (confirmed_at - created_at))/3600 AS confirm_hours,
      EXTRACT(EPOCH FROM (packed_at - confirmed_at))/3600 AS pack_hours,
      EXTRACT(EPOCH FROM (shipped_at - packed_at))/3600 AS ship_hours,
      EXTRACT(EPOCH FROM (delivered_at - shipped_at))/24 AS transit_days,
      EXTRACT(EPOCH FROM (delivered_at - created_at))/24 AS o2d_days
    FROM orders o
    WHERE o.created_at BETWEEN from_ts AND to_ts
      AND (city_filter IS NULL OR o.client_ville = city_filter)
      AND (courier_filter IS NULL OR o.courier = courier_filter)
      AND o.confirmed_at IS NOT NULL
      AND o.packed_at IS NOT NULL  
      AND o.shipped_at IS NOT NULL
      AND o.delivered_at IS NOT NULL
  )
  SELECT 
    percentile_cont(0.5) WITHIN GROUP (ORDER BY confirm_hours),
    percentile_cont(0.9) WITHIN GROUP (ORDER BY confirm_hours),
    percentile_cont(0.5) WITHIN GROUP (ORDER BY pack_hours),
    percentile_cont(0.9) WITHIN GROUP (ORDER BY pack_hours),
    percentile_cont(0.5) WITHIN GROUP (ORDER BY ship_hours),
    percentile_cont(0.9) WITHIN GROUP (ORDER BY ship_hours),
    percentile_cont(0.5) WITHIN GROUP (ORDER BY transit_days),
    percentile_cont(0.9) WITHIN GROUP (ORDER BY transit_days),
    percentile_cont(0.5) WITHIN GROUP (ORDER BY o2d_days),
    percentile_cont(0.9) WITHIN GROUP (ORDER BY o2d_days)
  INTO t_confirm_p50, t_confirm_p90, t_pack_p50, t_pack_p90, t_ship_p50, t_ship_p90, t_transit_p50, t_transit_p90, t_o2d_p50, t_o2d_p90
  FROM filtered_orders;

  RETURN NEXT;
END;
$function$;
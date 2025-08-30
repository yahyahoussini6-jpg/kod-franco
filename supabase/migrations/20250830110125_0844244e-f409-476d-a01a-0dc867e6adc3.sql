-- Fix the geo analytics function type mismatch
DROP FUNCTION IF EXISTS rpc_analytics_geo(timestamptz, timestamptz, jsonb);

CREATE OR REPLACE FUNCTION rpc_analytics_geo(
  from_ts timestamptz,
  to_ts timestamptz,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  city text,
  courier text,
  delivered_orders bigint,
  delivered_revenue numeric,
  delivery_rate numeric,
  transit_p90_days numeric,
  shipping_cost_per_delivered numeric
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.city,
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
  GROUP BY o.city, o.courier
  HAVING COUNT(CASE WHEN o.status = 'livree' THEN 1 END) > 0
  ORDER BY delivered_revenue DESC;
END;
$$;

-- Fix the overview analytics function to ensure it calculates real metrics
DROP FUNCTION IF EXISTS rpc_analytics_overview(timestamptz, timestamptz, jsonb);

CREATE OR REPLACE FUNCTION rpc_analytics_overview(
  from_ts timestamptz,
  to_ts timestamptz,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  delivered_orders bigint,
  delivered_revenue numeric,
  delivered_aov numeric,
  delivery_rate numeric,
  rto_rate numeric,
  cancel_rate numeric,
  contribution numeric,
  contribution_pct numeric,
  attempted_gmv numeric
) LANGUAGE plpgsql AS $$
DECLARE
  total_delivered bigint;
  total_shipped bigint;
  total_preship bigint;
BEGIN
  -- Get counts for rate calculations
  SELECT 
    COUNT(CASE WHEN o.status = 'livree' THEN 1 END),
    COUNT(CASE WHEN o.shipped_at IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN o.status IN ('nouvelle', 'confirmee', 'en_preparation') THEN 1 END)
  INTO total_delivered, total_shipped, total_preship
  FROM orders o
  WHERE o.created_at >= from_ts AND o.created_at <= to_ts;

  RETURN QUERY
  SELECT 
    COUNT(CASE WHEN o.status = 'livree' THEN 1 END) as delivered_orders,
    COALESCE(SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END), 0)::numeric as delivered_revenue,
    COALESCE(
      CASE 
        WHEN COUNT(CASE WHEN o.status = 'livree' THEN 1 END) > 0 
        THEN SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END)::numeric / COUNT(CASE WHEN o.status = 'livree' THEN 1 END)::numeric
        ELSE 0 
      END, 0
    )::numeric as delivered_aov,
    COALESCE(
      CASE 
        WHEN total_shipped > 0 
        THEN (total_delivered::numeric / total_shipped::numeric)
        ELSE 0 
      END, 0
    )::numeric as delivery_rate,
    COALESCE(
      CASE 
        WHEN total_shipped > 0 
        THEN (COUNT(CASE WHEN o.status = 'retournee' THEN 1 END)::numeric / total_shipped::numeric)
        ELSE 0 
      END, 0
    )::numeric as rto_rate,
    COALESCE(
      CASE 
        WHEN total_preship > 0 
        THEN (COUNT(CASE WHEN o.status = 'annulee' THEN 1 END)::numeric / total_preship::numeric)
        ELSE 0 
      END, 0
    )::numeric as cancel_rate,
    COALESCE(
      SUM(CASE 
        WHEN o.status = 'livree' 
        THEN o.order_total - COALESCE(o.discount_total, 0) - COALESCE(o.cogs_total, 0) - COALESCE(o.shipping_cost, 0) - COALESCE(o.cod_fee, 0)
        ELSE 0 
      END), 0
    )::numeric as contribution,
    COALESCE(
      CASE 
        WHEN SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END) > 0 
        THEN (
          SUM(CASE 
            WHEN o.status = 'livree' 
            THEN o.order_total - COALESCE(o.discount_total, 0) - COALESCE(o.cogs_total, 0) - COALESCE(o.shipping_cost, 0) - COALESCE(o.cod_fee, 0)
            ELSE 0 
          END)::numeric / SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END)::numeric
        )
        ELSE 0 
      END, 0
    )::numeric as contribution_pct,
    COALESCE(SUM(o.order_total), 0)::numeric as attempted_gmv
  FROM orders o
  WHERE o.created_at >= from_ts AND o.created_at <= to_ts;
END;
$$;

-- Create/update the daily overview view to show real data
DROP VIEW IF EXISTS v_overview_daily;

CREATE VIEW v_overview_daily AS
SELECT 
  DATE(o.created_at) as d,
  COUNT(CASE WHEN o.status = 'livree' THEN 1 END) as delivered_orders,
  COALESCE(SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END), 0) as delivered_revenue,
  COUNT(*) as total_orders,
  COALESCE(SUM(o.order_total), 0) as total_gmv
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY d DESC;

-- Create/update the funnel counts view to show real data
DROP VIEW IF EXISTS v_funnel_counts;

CREATE VIEW v_funnel_counts AS
SELECT 
  DATE(o.created_at) as d,
  COUNT(CASE WHEN o.status = 'nouvelle' THEN 1 END) as nouvelle,
  COUNT(CASE WHEN o.status = 'confirmee' THEN 1 END) as confirmee,
  COUNT(CASE WHEN o.status = 'en_preparation' THEN 1 END) as en_preparation,
  COUNT(CASE WHEN o.status = 'expediee' THEN 1 END) as expediee,
  COUNT(CASE WHEN o.status = 'livree' THEN 1 END) as livree,
  COUNT(CASE WHEN o.status = 'annulee' THEN 1 END) as annulee,
  COUNT(CASE WHEN o.status = 'retournee' THEN 1 END) as retournee
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY d DESC;
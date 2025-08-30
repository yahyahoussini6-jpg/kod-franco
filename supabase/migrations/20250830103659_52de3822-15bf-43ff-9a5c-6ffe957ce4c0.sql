-- Analytics Migration: COD Analytics Tables and Functions
-- This migration creates the complete analytics infrastructure

-- First, let's add missing columns to the orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_total NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cod_fee NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cogs_total NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS courier TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS source_channel TEXT,
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- Rename existing statut column to status and update values
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'statut') THEN
    -- Add new status column
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT;
    
    -- Migrate data from statut to status
    UPDATE public.orders SET status = CASE 
      WHEN statut = 'NOUVELLE' THEN 'nouvelle'
      WHEN statut = 'CONFIRMEE' THEN 'confirmee' 
      WHEN statut = 'EN_PREPARATION' THEN 'en_preparation'
      WHEN statut = 'EXPEDIEE' THEN 'expediee'
      WHEN statut = 'LIVREE' THEN 'livree'
      WHEN statut = 'ANNULEE' THEN 'annulee'
      WHEN statut = 'RETOURNEE' THEN 'retournee'
      ELSE 'nouvelle'
    END WHERE status IS NULL;
    
    -- Drop the old column
    ALTER TABLE public.orders DROP COLUMN IF EXISTS statut;
  END IF;
END $$;

-- Add constraint to status column (using DO block to handle IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('nouvelle','confirmee','en_preparation','expediee','livree','annulee','retournee'));
  END IF;
END $$;

-- Set default for status
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'nouvelle';

-- Add missing columns to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS cogs_per_unit NUMERIC(12,2) DEFAULT 0;

-- Update existing order_items with unit_price from product_prix if missing
UPDATE public.order_items 
SET unit_price = product_prix 
WHERE unit_price IS NULL;

-- Create status_events table for tracking status changes
CREATE TABLE IF NOT EXISTS public.status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on new table
ALTER TABLE public.status_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for status_events
CREATE POLICY IF NOT EXISTS "Admins can manage status events"
ON public.status_events FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON public.orders(delivered_at);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON public.orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_city ON public.orders(city);
CREATE INDEX IF NOT EXISTS idx_orders_courier ON public.orders(courier);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_utm_source ON public.orders(utm_source);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_category ON public.order_items(category);

CREATE INDEX IF NOT EXISTS idx_status_events_order_id ON public.status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_status_events_created_at ON public.status_events(created_at);

-- Create analytics views
CREATE OR REPLACE VIEW public.v_overview_daily AS
SELECT
  date_trunc('day', delivered_at) AS d,
  COUNT(*) AS delivered_orders,
  SUM(order_total) AS delivered_revenue,
  AVG(order_total) AS delivered_aov
FROM public.orders
WHERE status = 'livree' AND delivered_at IS NOT NULL
GROUP BY 1;

CREATE OR REPLACE VIEW public.v_funnel_counts AS
SELECT
  date_trunc('day', created_at) AS d,
  COUNT(*) FILTER (WHERE status = 'nouvelle') AS nouvelle,
  COUNT(*) FILTER (WHERE status = 'confirmee') AS confirmee,
  COUNT(*) FILTER (WHERE status = 'en_preparation') AS en_preparation,
  COUNT(*) FILTER (WHERE status = 'expediee') AS expediee,
  COUNT(*) FILTER (WHERE status = 'livree') AS livree,
  COUNT(*) FILTER (WHERE status = 'annulee') AS annulee,
  COUNT(*) FILTER (WHERE status = 'retournee') AS retournee
FROM public.orders
GROUP BY 1;

-- Analytics RPC functions
CREATE OR REPLACE FUNCTION public.rpc_analytics_overview(
  from_ts TIMESTAMPTZ,
  to_ts TIMESTAMPTZ,
  filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  delivered_orders BIGINT,
  delivered_revenue NUMERIC,
  delivered_aov NUMERIC,
  delivery_rate NUMERIC,
  rto_rate NUMERIC,
  cancel_rate NUMERIC,
  contribution NUMERIC,
  contribution_pct NUMERIC,
  attempted_gmv NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  city_filter TEXT := filters->>'city';
  courier_filter TEXT := filters->>'courier';
  utm_source_filter TEXT := filters->>'utm_source';
  category_filter TEXT := filters->>'category';
  total_orders BIGINT;
  shipped_orders BIGINT;
  cancelled_orders BIGINT;
  pre_ship_orders BIGINT;
BEGIN
  -- Base query with filters
  WITH filtered_orders AS (
    SELECT o.*
    FROM orders o
    WHERE o.created_at BETWEEN from_ts AND to_ts
      AND (city_filter IS NULL OR o.city = city_filter)
      AND (courier_filter IS NULL OR o.courier = courier_filter)
      AND (utm_source_filter IS NULL OR o.utm_source = utm_source_filter)
      AND (category_filter IS NULL OR EXISTS (
        SELECT 1 FROM order_items oi 
        WHERE oi.order_id = o.id AND oi.category = category_filter
      ))
  )
  SELECT 
    COUNT(*) FILTER (WHERE status = 'livree'),
    COALESCE(SUM(order_total) FILTER (WHERE status = 'livree'), 0),
    COALESCE(AVG(order_total) FILTER (WHERE status = 'livree'), 0),
    COUNT(*) FILTER (WHERE status = 'expediee'),
    COUNT(*) FILTER (WHERE status = 'retournee'),
    COUNT(*) FILTER (WHERE status = 'annulee'),
    COUNT(*) FILTER (WHERE status IN ('nouvelle', 'confirmee', 'en_preparation')),
    COALESCE(SUM(order_total - COALESCE(discount_total,0) - COALESCE(cogs_total,0) - COALESCE(shipping_cost,0) - COALESCE(cod_fee,0)) FILTER (WHERE status = 'livree'), 0),
    COALESCE(SUM(order_total), 0)
  INTO delivered_orders, delivered_revenue, delivered_aov, shipped_orders, rto_rate, cancelled_orders, pre_ship_orders, contribution, attempted_gmv
  FROM filtered_orders;

  -- Calculate rates
  delivery_rate := CASE WHEN shipped_orders > 0 THEN delivered_orders::NUMERIC / shipped_orders ELSE 0 END;
  rto_rate := CASE WHEN shipped_orders > 0 THEN rto_rate::NUMERIC / shipped_orders ELSE 0 END;
  cancel_rate := CASE WHEN (pre_ship_orders + cancelled_orders) > 0 THEN cancelled_orders::NUMERIC / (pre_ship_orders + cancelled_orders) ELSE 0 END;
  contribution_pct := CASE WHEN delivered_revenue > 0 THEN contribution / delivered_revenue ELSE 0 END;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_analytics_sla(
  from_ts TIMESTAMPTZ,
  to_ts TIMESTAMPTZ,
  filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  t_confirm_p50 NUMERIC,
  t_confirm_p90 NUMERIC,
  t_pack_p50 NUMERIC,
  t_pack_p90 NUMERIC,
  t_ship_p50 NUMERIC,
  t_ship_p90 NUMERIC,
  t_transit_p50 NUMERIC,
  t_transit_p90 NUMERIC,
  t_o2d_p50 NUMERIC,
  t_o2d_p90 NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
      AND (city_filter IS NULL OR o.city = city_filter)
      AND (courier_filter IS NULL OR o.courier = courier_filter)
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
$$;

CREATE OR REPLACE FUNCTION public.rpc_analytics_geo(
  from_ts TIMESTAMPTZ,
  to_ts TIMESTAMPTZ,
  filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  city TEXT,
  courier TEXT,
  delivered_orders BIGINT,
  delivered_revenue NUMERIC,
  delivery_rate NUMERIC,
  transit_p90_days NUMERIC,
  shipping_cost_per_delivered NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH geo_stats AS (
    SELECT 
      o.city,
      o.courier,
      COUNT(*) FILTER (WHERE o.status = 'livree') AS delivered_count,
      COALESCE(SUM(o.order_total) FILTER (WHERE o.status = 'livree'), 0) AS delivered_rev,
      COUNT(*) FILTER (WHERE o.status = 'expediee') AS shipped_count,
      percentile_cont(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (o.delivered_at - o.shipped_at))/86400) FILTER (WHERE o.status = 'livree' AND o.delivered_at IS NOT NULL AND o.shipped_at IS NOT NULL) AS transit_p90,
      COALESCE(AVG(o.shipping_cost) FILTER (WHERE o.status = 'livree'), 0) AS avg_shipping_cost
    FROM orders o
    WHERE o.created_at BETWEEN from_ts AND to_ts
      AND o.city IS NOT NULL
      AND o.courier IS NOT NULL
    GROUP BY o.city, o.courier
  )
  SELECT 
    gs.city,
    gs.courier,
    gs.delivered_count,
    gs.delivered_rev,
    CASE WHEN gs.shipped_count > 0 THEN gs.delivered_count::NUMERIC / gs.shipped_count ELSE 0 END,
    COALESCE(gs.transit_p90, 0),
    gs.avg_shipping_cost
  FROM geo_stats gs
  WHERE gs.delivered_count > 0 OR gs.shipped_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_analytics_products(
  from_ts TIMESTAMPTZ,
  to_ts TIMESTAMPTZ,
  filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  category TEXT,
  delivered_units BIGINT,
  delivered_revenue NUMERIC,
  sku_margin NUMERIC,
  return_rate NUMERIC,
  cancel_rate NUMERIC,
  aov_contrib NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH product_stats AS (
    SELECT 
      oi.product_id,
      oi.product_nom AS product_name,
      oi.category,
      SUM(oi.quantite) FILTER (WHERE o.status = 'livree') AS delivered_qty,
      SUM(oi.quantite * oi.unit_price) FILTER (WHERE o.status = 'livree') AS delivered_rev,
      SUM((oi.unit_price - COALESCE(oi.cogs_per_unit, 0)) * oi.quantite) FILTER (WHERE o.status = 'livree') AS margin,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'retournee') AS returned_orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'annulee') AS cancelled_orders,
      COUNT(DISTINCT o.id) AS total_orders
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at BETWEEN from_ts AND to_ts
    GROUP BY oi.product_id, oi.product_nom, oi.category
  )
  SELECT 
    ps.product_id,
    ps.product_name,
    ps.category,
    COALESCE(ps.delivered_qty, 0),
    COALESCE(ps.delivered_rev, 0),
    COALESCE(ps.margin, 0),
    CASE WHEN ps.total_orders > 0 THEN ps.returned_orders::NUMERIC / ps.total_orders ELSE 0 END,
    CASE WHEN ps.total_orders > 0 THEN ps.cancelled_orders::NUMERIC / ps.total_orders ELSE 0 END,
    COALESCE(ps.delivered_rev / NULLIF(ps.delivered_qty, 0), 0)
  FROM product_stats ps
  WHERE ps.delivered_qty > 0 OR ps.total_orders > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_analytics_marketing(
  from_ts TIMESTAMPTZ,
  to_ts TIMESTAMPTZ,
  filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  source TEXT,
  campaign TEXT,
  delivered_orders BIGINT,
  delivered_revenue NUMERIC,
  delivered_aov NUMERIC,
  delivered_rate NUMERIC,
  rto_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH marketing_stats AS (
    SELECT 
      COALESCE(o.utm_source, 'direct') AS source,
      COALESCE(o.utm_campaign, 'none') AS campaign,
      COUNT(*) FILTER (WHERE o.status = 'livree') AS delivered_count,
      COALESCE(SUM(o.order_total) FILTER (WHERE o.status = 'livree'), 0) AS delivered_rev,
      COUNT(*) FILTER (WHERE o.status = 'expediee') AS shipped_count,
      COUNT(*) FILTER (WHERE o.status = 'retournee') AS returned_count
    FROM orders o
    WHERE o.created_at BETWEEN from_ts AND to_ts
    GROUP BY COALESCE(o.utm_source, 'direct'), COALESCE(o.utm_campaign, 'none')
  )
  SELECT 
    ms.source,
    ms.campaign,
    ms.delivered_count,
    ms.delivered_rev,
    CASE WHEN ms.delivered_count > 0 THEN ms.delivered_rev / ms.delivered_count ELSE 0 END,
    CASE WHEN ms.shipped_count > 0 THEN ms.delivered_count::NUMERIC / ms.shipped_count ELSE 0 END,
    CASE WHEN ms.shipped_count > 0 THEN ms.returned_count::NUMERIC / ms.shipped_count ELSE 0 END
  FROM marketing_stats ms
  WHERE ms.delivered_count > 0 OR ms.shipped_count > 0;
END;
$$;

-- Grant permissions to authenticated users for analytics functions
GRANT EXECUTE ON FUNCTION public.rpc_analytics_overview TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_analytics_sla TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_analytics_geo TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_analytics_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_analytics_marketing TO authenticated;
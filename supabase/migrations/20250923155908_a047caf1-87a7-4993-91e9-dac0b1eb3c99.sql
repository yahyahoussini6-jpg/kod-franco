-- Add cost fields to products table for profit margin analysis
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0;

-- Add marketing cost fields to orders for better analytics
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS marketing_cost numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_term text;

-- Create table for customer lifetime value tracking
CREATE TABLE IF NOT EXISTS public.customer_clv (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL,
  phone text NOT NULL,
  current_clv numeric NOT NULL DEFAULT 0,
  predicted_clv_6m numeric NOT NULL DEFAULT 0,
  predicted_clv_12m numeric NOT NULL DEFAULT 0,
  first_order_date timestamp with time zone,
  last_order_date timestamp with time zone,
  total_orders integer NOT NULL DEFAULT 0,
  avg_order_value numeric NOT NULL DEFAULT 0,
  purchase_frequency numeric NOT NULL DEFAULT 0,
  churn_risk_score numeric NOT NULL DEFAULT 0,
  segments text[] DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customer_clv_phone_unique UNIQUE (phone)
);

-- Create table for sales forecasting
CREATE TABLE IF NOT EXISTS public.sales_forecasts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_date date NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  product_id uuid,
  category_id uuid,
  predicted_orders integer NOT NULL DEFAULT 0,
  predicted_revenue numeric NOT NULL DEFAULT 0,
  confidence_level numeric NOT NULL DEFAULT 0,
  seasonal_factor numeric NOT NULL DEFAULT 1,
  trend_factor numeric NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  model_version text DEFAULT 'v1'
);

-- Create table for social media metrics
CREATE TABLE IF NOT EXISTS public.social_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  metric_date date NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  post_id text,
  campaign_id text,
  utm_source text,
  utm_campaign text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_metrics_unique UNIQUE (platform, metric_date, metric_type, post_id, campaign_id)
);

-- Enable RLS on new tables
ALTER TABLE public.customer_clv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin can manage CLV data" ON public.customer_clv FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage sales forecasts" ON public.sales_forecasts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage social metrics" ON public.social_metrics FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to calculate CLV
CREATE OR REPLACE FUNCTION public.calculate_customer_clv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update CLV data for all customers
  INSERT INTO public.customer_clv (
    customer_id,
    phone,
    current_clv,
    predicted_clv_6m,
    predicted_clv_12m,
    first_order_date,
    last_order_date,
    total_orders,
    avg_order_value,
    purchase_frequency,
    churn_risk_score
  )
  SELECT 
    cp.id as customer_id,
    cp.phone,
    COALESCE(cp.delivered_net_revenue_mad, 0) as current_clv,
    -- Simple prediction: current CLV * 1.5 for 6 months
    COALESCE(cp.delivered_net_revenue_mad, 0) * 1.5 as predicted_clv_6m,
    -- Simple prediction: current CLV * 2.5 for 12 months
    COALESCE(cp.delivered_net_revenue_mad, 0) * 2.5 as predicted_clv_12m,
    cp.first_order_at,
    cp.last_order_at,
    cp.delivered_orders_cnt,
    CASE 
      WHEN cp.delivered_orders_cnt > 0 THEN cp.delivered_net_revenue_mad / cp.delivered_orders_cnt
      ELSE 0 
    END as avg_order_value,
    CASE 
      WHEN cp.first_order_at IS NOT NULL AND cp.last_order_at IS NOT NULL THEN
        cp.delivered_orders_cnt::numeric / GREATEST(1, EXTRACT(DAYS FROM (cp.last_order_at - cp.first_order_at)) / 30.0)
      ELSE 0 
    END as purchase_frequency,
    -- Simple churn risk: days since last order / 30
    CASE 
      WHEN cp.last_order_at IS NOT NULL THEN
        LEAST(1.0, EXTRACT(DAYS FROM (now() - cp.last_order_at)) / 90.0)
      ELSE 1.0 
    END as churn_risk_score
  FROM public.customer_profiles cp
  ON CONFLICT (phone) 
  DO UPDATE SET
    current_clv = EXCLUDED.current_clv,
    predicted_clv_6m = EXCLUDED.predicted_clv_6m,
    predicted_clv_12m = EXCLUDED.predicted_clv_12m,
    first_order_date = EXCLUDED.first_order_date,
    last_order_date = EXCLUDED.last_order_date,
    total_orders = EXCLUDED.total_orders,
    avg_order_value = EXCLUDED.avg_order_value,
    purchase_frequency = EXCLUDED.purchase_frequency,
    churn_risk_score = EXCLUDED.churn_risk_score,
    updated_at = now();
END;
$$;

-- Create function for enhanced analytics with CLV and profit margins
CREATE OR REPLACE FUNCTION public.rpc_analytics_clv(from_ts timestamp with time zone, to_ts timestamp with time zone)
RETURNS TABLE(
  total_customers bigint,
  avg_clv numeric,
  high_value_customers bigint,
  churn_risk_customers bigint,
  predicted_revenue_6m numeric,
  predicted_revenue_12m numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_customers,
    AVG(c.current_clv) as avg_clv,
    COUNT(*) FILTER (WHERE c.current_clv > 1000)::bigint as high_value_customers,
    COUNT(*) FILTER (WHERE c.churn_risk_score > 0.7)::bigint as churn_risk_customers,
    SUM(c.predicted_clv_6m) as predicted_revenue_6m,
    SUM(c.predicted_clv_12m) as predicted_revenue_12m
  FROM public.customer_clv c
  WHERE c.created_at BETWEEN from_ts AND to_ts;
END;
$$;

-- Create function for profit margin analysis
CREATE OR REPLACE FUNCTION public.rpc_analytics_profit_margins(from_ts timestamp with time zone, to_ts timestamp with time zone)
RETURNS TABLE(
  product_id uuid,
  product_name text,
  category text,
  units_sold bigint,
  gross_revenue numeric,
  cost_of_goods numeric,
  gross_profit numeric,
  profit_margin_pct numeric,
  avg_selling_price numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.nom as product_name,
    c.name as category,
    COALESCE(SUM(oi.quantite), 0)::bigint as units_sold,
    COALESCE(SUM(oi.product_prix * oi.quantite), 0) as gross_revenue,
    COALESCE(SUM(p.cost_price * oi.quantite), 0) as cost_of_goods,
    COALESCE(SUM((oi.product_prix - p.cost_price) * oi.quantite), 0) as gross_profit,
    CASE 
      WHEN SUM(oi.product_prix * oi.quantite) > 0 THEN
        (SUM((oi.product_prix - p.cost_price) * oi.quantite) / SUM(oi.product_prix * oi.quantite)) * 100
      ELSE 0 
    END as profit_margin_pct,
    CASE 
      WHEN SUM(oi.quantite) > 0 THEN SUM(oi.product_prix * oi.quantite) / SUM(oi.quantite)
      ELSE 0 
    END as avg_selling_price
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN public.order_items oi ON p.id = oi.product_id
  LEFT JOIN public.orders o ON oi.order_id = o.id
  WHERE o.created_at BETWEEN from_ts AND to_ts
    AND o.status = 'livree'
  GROUP BY p.id, p.nom, c.name
  HAVING SUM(oi.quantite) > 0
  ORDER BY gross_profit DESC;
END;
$$;

-- Create trigger to auto-update CLV when customer profiles change
CREATE OR REPLACE FUNCTION public.trigger_update_clv()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Recalculate CLV for this customer
  PERFORM public.calculate_customer_clv();
  RETURN NEW;
END;
$$;

CREATE TRIGGER customer_profile_clv_update
  AFTER UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_clv();
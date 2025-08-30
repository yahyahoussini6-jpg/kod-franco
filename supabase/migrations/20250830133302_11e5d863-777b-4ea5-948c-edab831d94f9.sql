-- Create or update the funnel counts view
CREATE OR REPLACE VIEW v_funnel_counts AS
SELECT 
  CURRENT_DATE as d,
  COUNT(CASE WHEN status = 'nouvelle' THEN 1 END) as nouvelle,
  COUNT(CASE WHEN status = 'confirmee' THEN 1 END) as confirmee,
  COUNT(CASE WHEN status = 'en_preparation' THEN 1 END) as en_preparation,
  COUNT(CASE WHEN status = 'expediee' THEN 1 END) as expediee,
  COUNT(CASE WHEN status = 'livree' THEN 1 END) as livree,
  COUNT(CASE WHEN status = 'annulee' THEN 1 END) as annulee,
  COUNT(CASE WHEN status = 'retournee' THEN 1 END) as retournee
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY CURRENT_DATE;

-- Create or update the daily overview view  
CREATE OR REPLACE VIEW v_overview_daily AS
SELECT 
  DATE(created_at) as d,
  COUNT(CASE WHEN status = 'livree' THEN 1 END) as delivered_orders,
  COALESCE(SUM(CASE WHEN status = 'livree' THEN order_total ELSE 0 END), 0) as delivered_revenue,
  CASE 
    WHEN COUNT(CASE WHEN status = 'livree' THEN 1 END) > 0 
    THEN SUM(CASE WHEN status = 'livree' THEN order_total ELSE 0 END) / COUNT(CASE WHEN status = 'livree' THEN 1 END)
    ELSE 0 
  END as delivered_aov,
  COUNT(*) as total_orders,
  COALESCE(SUM(order_total), 0) as total_gmv
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY d DESC;
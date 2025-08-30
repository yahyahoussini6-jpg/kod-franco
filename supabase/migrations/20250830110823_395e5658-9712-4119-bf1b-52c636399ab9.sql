-- Update the daily overview view to include delivered_aov
DROP VIEW IF EXISTS v_overview_daily;

CREATE VIEW v_overview_daily AS
SELECT 
  DATE(o.created_at) as d,
  COUNT(CASE WHEN o.status = 'livree' THEN 1 END) as delivered_orders,
  COALESCE(SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END), 0) as delivered_revenue,
  COALESCE(
    CASE 
      WHEN COUNT(CASE WHEN o.status = 'livree' THEN 1 END) > 0 
      THEN SUM(CASE WHEN o.status = 'livree' THEN o.order_total ELSE 0 END) / COUNT(CASE WHEN o.status = 'livree' THEN 1 END)
      ELSE 0 
    END, 0
  ) as delivered_aov,
  COUNT(*) as total_orders,
  COALESCE(SUM(o.order_total), 0) as total_gmv
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY d DESC;
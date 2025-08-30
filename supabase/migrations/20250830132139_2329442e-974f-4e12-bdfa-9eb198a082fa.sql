-- Update order_total calculation based on order items
UPDATE orders 
SET order_total = (
  SELECT COALESCE(SUM(product_prix * quantite), 0)
  FROM order_items 
  WHERE order_items.order_id = orders.id
)
WHERE id IN (
  SELECT DISTINCT order_id 
  FROM order_items
);

-- Create a trigger to automatically calculate order_total when order_items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the order total based on all its items
  UPDATE orders
  SET order_total = (
    SELECT COALESCE(SUM(product_prix * quantite), 0)
    FROM order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT, UPDATE, DELETE on order_items
DROP TRIGGER IF EXISTS trigger_update_order_total_insert ON order_items;
DROP TRIGGER IF EXISTS trigger_update_order_total_update ON order_items;
DROP TRIGGER IF EXISTS trigger_update_order_total_delete ON order_items;

CREATE TRIGGER trigger_update_order_total_insert
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trigger_update_order_total_update
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trigger_update_order_total_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();
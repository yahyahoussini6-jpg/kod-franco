-- Create product variants for existing products using only existing columns
INSERT INTO product_variants (
  product_id,
  name,
  sku,
  cost,
  price
)
SELECT 
  p.id,
  p.nom || ' - Standard' as name,
  UPPER(SUBSTRING(p.nom FROM 1 FOR 3)) || '-STD-' || SUBSTRING(p.id::text FROM 1 FOR 4) as sku,
  p.prix * 0.6 as cost,
  p.prix as price
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
);

-- Create initial inventory records for each variant
INSERT INTO inventory (
  variant_id,
  stock_on_hand,
  min_stock_level,
  reserved
)
SELECT 
  pv.id,
  CASE WHEN p.en_stock THEN 100 ELSE 0 END,
  10,
  0
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i WHERE i.variant_id = pv.id
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_id ON stock_movements(variant_id);
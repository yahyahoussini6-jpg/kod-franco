-- Create product variants for existing products
-- This will create variants for products that have size/color variables

INSERT INTO product_variants (
  product_id,
  name,
  sku,
  cost,
  price,
  attributes
)
SELECT 
  p.id,
  CASE 
    WHEN jsonb_array_length(p.variables->'sizes') > 0 
    THEN p.nom || ' - Taille ' || size_val->>'value'
    ELSE p.nom || ' - Standard'
  END as name,
  CASE 
    WHEN jsonb_array_length(p.variables->'sizes') > 0 
    THEN UPPER(SUBSTRING(p.nom FROM 1 FOR 3)) || '-' || size_val->>'value'
    ELSE UPPER(SUBSTRING(p.nom FROM 1 FOR 3)) || '-STD'
  END as sku,
  p.prix * 0.6 as cost, -- Assuming 40% margin
  p.prix as price,
  CASE 
    WHEN jsonb_array_length(p.variables->'sizes') > 0 
    THEN jsonb_build_object('size', size_val->>'value')
    ELSE '{}'::jsonb
  END as attributes
FROM products p
CROSS JOIN LATERAL (
  CASE 
    WHEN jsonb_array_length(p.variables->'sizes') > 0 
    THEN jsonb_array_elements_text(p.variables->'sizes')
    ELSE '["standard"]'::jsonb
  END
) AS size_val(value)
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
  CASE WHEN p.en_stock THEN 100 ELSE 0 END, -- Default stock
  10, -- Minimum stock level
  0   -- No reservations initially
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i WHERE i.variant_id = pv.id
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_id ON stock_movements(variant_id);
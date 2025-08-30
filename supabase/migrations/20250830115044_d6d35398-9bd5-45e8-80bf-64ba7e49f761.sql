-- Insert sample data for testing

-- First, insert some products
INSERT INTO public.products (nom, description, prix, en_stock, slug) VALUES
('T-Shirt Premium', 'T-shirt en coton bio de haute qualité', 199.00, true, 't-shirt-premium'),
('Hoodie Classique', 'Sweat à capuche confortable pour toutes saisons', 399.00, true, 'hoodie-classique'),
('Jean Slim', 'Jean coupe slim moderne et tendance', 499.00, true, 'jean-slim'),
('Baskets Sport', 'Chaussures de sport performantes', 799.00, true, 'baskets-sport'),
('Sac à Dos', 'Sac à dos pratique et résistant', 299.00, true, 'sac-a-dos')
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants with different sizes/colors
INSERT INTO public.product_variants (product_id, sku, name, price, cost) 
SELECT 
  p.id,
  CASE 
    WHEN p.slug = 't-shirt-premium' THEN 'TSH-001-' || size_color.variant
    WHEN p.slug = 'hoodie-classique' THEN 'HOD-001-' || size_color.variant  
    WHEN p.slug = 'jean-slim' THEN 'JEA-001-' || size_color.variant
    WHEN p.slug = 'baskets-sport' THEN 'BAS-001-' || size_color.variant
    WHEN p.slug = 'sac-a-dos' THEN 'SAC-001-' || size_color.variant
  END as sku,
  p.nom || ' - ' || size_color.label as name,
  p.prix + size_color.price_modifier as price,
  (p.prix + size_color.price_modifier) * 0.6 as cost
FROM public.products p
CROSS JOIN (
  VALUES 
    ('BLK-S', 'Noir S', 0),
    ('BLK-M', 'Noir M', 0), 
    ('BLK-L', 'Noir L', 0),
    ('WHT-S', 'Blanc S', 0),
    ('WHT-M', 'Blanc M', 0),
    ('WHT-L', 'Blanc L', 0),
    ('RED-M', 'Rouge M', 20),
    ('BLU-L', 'Bleu L', 20)
) as size_color(variant, label, price_modifier)
ON CONFLICT (sku) DO NOTHING;

-- Insert inventory data for each variant
INSERT INTO public.inventory (variant_id, stock_on_hand, reserved, incoming, min_stock_level, location)
SELECT 
  pv.id,
  FLOOR(RANDOM() * 100 + 10)::INTEGER as stock_on_hand,
  FLOOR(RANDOM() * 10)::INTEGER as reserved,
  FLOOR(RANDOM() * 50)::INTEGER as incoming,
  CASE 
    WHEN RANDOM() < 0.3 THEN FLOOR(RANDOM() * 5 + 15)::INTEGER -- Some will be low stock
    ELSE FLOOR(RANDOM() * 10 + 5)::INTEGER
  END as min_stock_level,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'Entrepôt A'
    ELSE 'Entrepôt B'
  END as location
FROM public.product_variants pv
ON CONFLICT DO NOTHING;

-- Insert some stock movements
INSERT INTO public.stock_movements (variant_id, movement_type, quantity, reason, created_at)
SELECT 
  pv.id,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'in'
    WHEN RANDOM() < 0.7 THEN 'out'
    ELSE 'adjustment'
  END as movement_type,
  CASE 
    WHEN RANDOM() < 0.4 THEN FLOOR(RANDOM() * 50 + 10)::INTEGER
    ELSE -FLOOR(RANDOM() * 15 + 1)::INTEGER
  END as quantity,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Réception fournisseur'
    WHEN RANDOM() < 0.6 THEN 'Vente'
    ELSE 'Ajustement inventaire'
  END as reason,
  NOW() - (RANDOM() * INTERVAL '30 days') as created_at
FROM public.product_variants pv
ORDER BY RANDOM()
LIMIT 20;

-- Insert sample customer profiles
INSERT INTO public.customer_profiles (phone, full_name, city, address, email, risk_score, is_vip, marketing_opt_in)
VALUES 
('+212612345678', 'Ahmed Benali', 'Casablanca', '123 Rue Mohammed V', 'ahmed@email.com', 0.2, false, true),
('+212687654321', 'Fatima Zahra', 'Rabat', '456 Avenue Hassan II', 'fatima@email.com', 0.8, false, true),
('+212611223344', 'Mohamed Alami', 'Marrakech', '789 Boulevard Zerktouni', 'mohamed@email.com', 0.1, true, true),
('+212655443322', 'Aicha Bennani', 'Fes', '321 Rue des Mérinides', 'aicha@email.com', 0.4, false, false),
('+212698765432', 'Youssef Tazi', 'Tanger', '654 Avenue Pasteur', 'youssef@email.com', 0.6, false, true)
ON CONFLICT (phone) DO NOTHING;

-- Insert some sample orders
INSERT INTO public.orders (client_nom, client_phone, client_ville, client_adresse, order_total, status, created_at)
SELECT 
  cp.full_name,
  cp.phone,
  cp.city,
  cp.address,
  FLOOR(RANDOM() * 800 + 200)::NUMERIC as order_total,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'livree'
    WHEN RANDOM() < 0.5 THEN 'expediee'
    WHEN RANDOM() < 0.7 THEN 'confirmee'
    WHEN RANDOM() < 0.9 THEN 'nouvelle'
    ELSE 'retournee'
  END as status,
  NOW() - (RANDOM() * INTERVAL '60 days') as created_at
FROM public.customer_profiles cp
ORDER BY RANDOM()
LIMIT 15;

-- Insert some returns data  
INSERT INTO public.returns (return_code, order_id, customer_id, return_type, status, reason_code, reason_description, return_value)
SELECT 
  'RET-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0') as return_code,
  o.id as order_id,
  cp.id as customer_id,
  CASE 
    WHEN RANDOM() < 0.6 THEN 'rto'
    ELSE 'return'
  END as return_type,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'received'
    WHEN RANDOM() < 0.7 THEN 'in_transit'
    ELSE 'initiated'
  END as status,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'client_injoignable'
    WHEN RANDOM() < 0.7 THEN 'adresse_incorrecte'
    ELSE 'client_refuse'
  END as reason_code,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'Client injoignable après plusieurs tentatives'
    WHEN RANDOM() < 0.7 THEN 'Adresse de livraison incorrecte'
    ELSE 'Client refuse de réceptionner le colis'
  END as reason_description,
  o.order_total as return_value
FROM public.orders o
JOIN public.customer_profiles cp ON cp.phone = o.client_phone
WHERE o.status IN ('retournee', 'expediee')
ORDER BY RANDOM()
LIMIT 8;

-- Insert financial transactions
INSERT INTO public.financial_transactions (transaction_type, order_id, customer_id, amount, status, description)
SELECT 
  CASE 
    WHEN RANDOM() < 0.6 THEN 'sale'
    WHEN RANDOM() < 0.8 THEN 'cod_fee'
    ELSE 'shipping_fee'
  END as transaction_type,
  o.id as order_id,
  cp.id as customer_id,
  CASE 
    WHEN RANDOM() < 0.6 THEN o.order_total
    WHEN RANDOM() < 0.8 THEN 15.00
    ELSE 45.00
  END as amount,
  CASE 
    WHEN o.status = 'livree' THEN 'completed'
    WHEN RANDOM() < 0.8 THEN 'pending'
    ELSE 'failed'
  END as status,
  CASE 
    WHEN RANDOM() < 0.6 THEN 'Vente produit'
    WHEN RANDOM() < 0.8 THEN 'Frais COD'
    ELSE 'Frais de livraison'
  END as description
FROM public.orders o
JOIN public.customer_profiles cp ON cp.phone = o.client_phone
ORDER BY RANDOM()
LIMIT 25;
-- Insert sample data for testing (fixed version)

-- First, let's check if we have products and insert some if needed
INSERT INTO public.products (nom, description, prix, en_stock, slug) VALUES
('T-Shirt Premium', 'T-shirt en coton bio de haute qualité', 199.00, true, 't-shirt-premium'),
('Hoodie Classique', 'Sweat à capuche confortable pour toutes saisons', 399.00, true, 'hoodie-classique'),
('Jean Slim', 'Jean coupe slim moderne et tendance', 499.00, true, 'jean-slim'),
('Baskets Sport', 'Chaussures de sport performantes', 799.00, true, 'baskets-sport'),
('Sac à Dos', 'Sac à dos pratique et résistant', 299.00, true, 'sac-a-dos')
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants with proper SKU generation
INSERT INTO public.product_variants (product_id, sku, name, price, cost) 
VALUES
-- T-Shirt variants
((SELECT id FROM public.products WHERE slug = 't-shirt-premium'), 'TSH-001-BLK-S', 'T-Shirt Premium - Noir S', 199.00, 119.40),
((SELECT id FROM public.products WHERE slug = 't-shirt-premium'), 'TSH-001-BLK-M', 'T-Shirt Premium - Noir M', 199.00, 119.40),
((SELECT id FROM public.products WHERE slug = 't-shirt-premium'), 'TSH-001-BLK-L', 'T-Shirt Premium - Noir L', 199.00, 119.40),
((SELECT id FROM public.products WHERE slug = 't-shirt-premium'), 'TSH-001-WHT-M', 'T-Shirt Premium - Blanc M', 199.00, 119.40),

-- Hoodie variants  
((SELECT id FROM public.products WHERE slug = 'hoodie-classique'), 'HOD-001-BLK-M', 'Hoodie Classique - Noir M', 399.00, 239.40),
((SELECT id FROM public.products WHERE slug = 'hoodie-classique'), 'HOD-001-BLK-L', 'Hoodie Classique - Noir L', 399.00, 239.40),
((SELECT id FROM public.products WHERE slug = 'hoodie-classique'), 'HOD-001-RED-M', 'Hoodie Classique - Rouge M', 419.00, 251.40),

-- Jean variants
((SELECT id FROM public.products WHERE slug = 'jean-slim'), 'JEA-001-BLK-32', 'Jean Slim - Noir 32', 499.00, 299.40),
((SELECT id FROM public.products WHERE slug = 'jean-slim'), 'JEA-001-BLK-34', 'Jean Slim - Noir 34', 499.00, 299.40),
((SELECT id FROM public.products WHERE slug = 'jean-slim'), 'JEA-001-BLU-32', 'Jean Slim - Bleu 32', 519.00, 311.40),

-- Baskets variants
((SELECT id FROM public.products WHERE slug = 'baskets-sport'), 'BAS-001-WHT-42', 'Baskets Sport - Blanc 42', 799.00, 479.40),
((SELECT id FROM public.products WHERE slug = 'baskets-sport'), 'BAS-001-WHT-43', 'Baskets Sport - Blanc 43', 799.00, 479.40),
((SELECT id FROM public.products WHERE slug = 'baskets-sport'), 'BAS-001-BLK-42', 'Baskets Sport - Noir 42', 799.00, 479.40),

-- Sac variants
((SELECT id FROM public.products WHERE slug = 'sac-a-dos'), 'SAC-001-BLK', 'Sac à Dos - Noir', 299.00, 179.40),
((SELECT id FROM public.products WHERE slug = 'sac-a-dos'), 'SAC-001-BLU', 'Sac à Dos - Bleu', 299.00, 179.40)
ON CONFLICT (sku) DO NOTHING;

-- Insert inventory data for each variant
INSERT INTO public.inventory (variant_id, stock_on_hand, reserved, incoming, min_stock_level, location)
SELECT 
  pv.id,
  CASE 
    WHEN pv.sku LIKE '%TSH%' THEN 45
    WHEN pv.sku LIKE '%HOD%' THEN 23
    WHEN pv.sku LIKE '%JEA%' THEN 12
    WHEN pv.sku LIKE '%BAS%' THEN 8
    WHEN pv.sku LIKE '%SAC%' THEN 67
    ELSE 25
  END as stock_on_hand,
  CASE 
    WHEN pv.sku LIKE '%BLK%' THEN 5
    WHEN pv.sku LIKE '%WHT%' THEN 3
    ELSE 2
  END as reserved,
  CASE 
    WHEN pv.sku LIKE '%TSH%' THEN 20
    WHEN pv.sku LIKE '%HOD%' THEN 15
    ELSE 10
  END as incoming,
  CASE 
    WHEN pv.sku LIKE '%BAS%' THEN 15 -- Baskets have higher min stock
    ELSE 10
  END as min_stock_level,
  CASE 
    WHEN pv.sku LIKE '%TSH%' OR pv.sku LIKE '%HOD%' THEN 'Entrepôt A'
    ELSE 'Entrepôt B'
  END as location
FROM public.product_variants pv
ON CONFLICT DO NOTHING;

-- Insert some stock movements
INSERT INTO public.stock_movements (variant_id, movement_type, quantity, reason, created_at)
SELECT 
  pv.id,
  'in' as movement_type,
  50 as quantity,
  'Réception fournisseur' as reason,
  NOW() - INTERVAL '5 days' as created_at
FROM public.product_variants pv
LIMIT 5;

INSERT INTO public.stock_movements (variant_id, movement_type, quantity, reason, created_at)
SELECT 
  pv.id,
  'out' as movement_type,
  -3 as quantity,
  'Vente' as reason,
  NOW() - INTERVAL '2 days' as created_at
FROM public.product_variants pv
LIMIT 8;

INSERT INTO public.stock_movements (variant_id, movement_type, quantity, reason, created_at)
SELECT 
  pv.id,
  'adjustment' as movement_type,
  -2 as quantity,
  'Ajustement inventaire' as reason,
  NOW() - INTERVAL '1 day' as created_at
FROM public.product_variants pv
LIMIT 3;

-- Insert sample customer profiles
INSERT INTO public.customer_profiles (phone, full_name, city, address, email, risk_score, is_vip, marketing_opt_in)
VALUES 
('+212612345678', 'Ahmed Benali', 'Casablanca', '123 Rue Mohammed V', 'ahmed@email.com', 0.2, false, true),
('+212687654321', 'Fatima Zahra', 'Rabat', '456 Avenue Hassan II', 'fatima@email.com', 0.8, false, true),
('+212611223344', 'Mohamed Alami', 'Marrakech', '789 Boulevard Zerktouni', 'mohamed@email.com', 0.1, true, true),
('+212655443322', 'Aicha Bennani', 'Fes', '321 Rue des Mérinides', 'aicha@email.com', 0.4, false, false),
('+212698765432', 'Youssef Tazi', 'Tanger', '654 Avenue Pasteur', 'youssef@email.com', 0.6, false, true)
ON CONFLICT (phone) DO NOTHING;

-- Insert some sample orders with proper order_total and other fields
INSERT INTO public.orders (client_nom, client_phone, client_ville, client_adresse, order_total, shipping_cost, cod_fee, cogs_total, status, created_at)
VALUES 
('Ahmed Benali', '+212612345678', 'Casablanca', '123 Rue Mohammed V', 244.00, 45.00, 15.00, 119.40, 'livree', NOW() - INTERVAL '10 days'),
('Fatima Zahra', '+212687654321', 'Rabat', '456 Avenue Hassan II', 444.00, 45.00, 15.00, 239.40, 'expediee', NOW() - INTERVAL '3 days'),
('Mohamed Alami', '+212611223344', 'Marrakech', '789 Boulevard Zerktouni', 544.00, 45.00, 15.00, 299.40, 'livree', NOW() - INTERVAL '15 days'),
('Aicha Bennani', '+212655443322', 'Fes', '321 Rue des Mérinides', 844.00, 45.00, 15.00, 479.40, 'confirmee', NOW() - INTERVAL '2 days'),
('Youssef Tazi', '+212698765432', 'Tanger', '654 Avenue Pasteur', 344.00, 45.00, 15.00, 179.40, 'livree', NOW() - INTERVAL '7 days'),
('Ahmed Benali', '+212612345678', 'Casablanca', '123 Rue Mohammed V', 464.00, 45.00, 15.00, 239.40, 'retournee', NOW() - INTERVAL '20 days'),
('Fatima Zahra', '+212687654321', 'Rabat', '456 Avenue Hassan II', 244.00, 45.00, 15.00, 119.40, 'nouvelle', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Insert some returns data  
INSERT INTO public.returns (return_code, order_id, customer_id, return_type, status, reason_code, reason_description, return_value)
SELECT 
  'RET-' || LPAD(ROW_NUMBER() OVER()::TEXT, 6, '0') as return_code,
  o.id as order_id,
  cp.id as customer_id,
  CASE 
    WHEN o.status = 'retournee' THEN 'rto'
    ELSE 'return'
  END as return_type,
  CASE 
    WHEN o.status = 'retournee' THEN 'received'
    ELSE 'in_transit'
  END as status,
  'client_injoignable' as reason_code,
  'Client injoignable après plusieurs tentatives' as reason_description,
  o.order_total as return_value
FROM public.orders o
JOIN public.customer_profiles cp ON cp.phone = o.client_phone
WHERE o.status IN ('retournee')
LIMIT 5;

-- Insert financial transactions
INSERT INTO public.financial_transactions (transaction_type, order_id, customer_id, amount, status, description)
SELECT 
  'sale' as transaction_type,
  o.id as order_id,
  cp.id as customer_id,
  o.order_total as amount,
  CASE 
    WHEN o.status = 'livree' THEN 'completed'
    ELSE 'pending'
  END as status,
  'Vente produit' as description
FROM public.orders o
JOIN public.customer_profiles cp ON cp.phone = o.client_phone;

-- Insert COD fees
INSERT INTO public.financial_transactions (transaction_type, order_id, customer_id, amount, status, description)
SELECT 
  'cod_fee' as transaction_type,
  o.id as order_id,
  cp.id as customer_id,
  o.cod_fee as amount,
  CASE 
    WHEN o.status = 'livree' THEN 'completed'
    ELSE 'pending'
  END as status,
  'Frais COD' as description
FROM public.orders o
JOIN public.customer_profiles cp ON cp.phone = o.client_phone
WHERE o.cod_fee IS NOT NULL AND o.cod_fee > 0;
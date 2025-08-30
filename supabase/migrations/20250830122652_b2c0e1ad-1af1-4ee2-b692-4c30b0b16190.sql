-- Continue with sample data insertion

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
OFFSET 5
LIMIT 8;

INSERT INTO public.stock_movements (variant_id, movement_type, quantity, reason, created_at)
SELECT 
  pv.id,
  'adjustment' as movement_type,
  -2 as quantity,
  'Ajustement inventaire' as reason,
  NOW() - INTERVAL '1 day' as created_at
FROM public.product_variants pv
OFFSET 10
LIMIT 3;

-- Insert sample customer profiles (will be created automatically by trigger when orders are inserted)
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

-- Update customer profiles with additional data
UPDATE public.customer_profiles SET 
  email = CASE 
    WHEN phone = '+212612345678' THEN 'ahmed@email.com'
    WHEN phone = '+212687654321' THEN 'fatima@email.com'
    WHEN phone = '+212611223344' THEN 'mohamed@email.com'
    WHEN phone = '+212655443322' THEN 'aicha@email.com'
    WHEN phone = '+212698765432' THEN 'youssef@email.com'
  END,
  risk_score = CASE 
    WHEN phone = '+212612345678' THEN 0.2
    WHEN phone = '+212687654321' THEN 0.8
    WHEN phone = '+212611223344' THEN 0.1
    WHEN phone = '+212655443322' THEN 0.4
    WHEN phone = '+212698765432' THEN 0.6
  END,
  is_vip = CASE 
    WHEN phone = '+212611223344' THEN true
    ELSE false
  END,
  marketing_opt_in = CASE 
    WHEN phone != '+212655443322' THEN true
    ELSE false
  END
WHERE phone IN ('+212612345678', '+212687654321', '+212611223344', '+212655443322', '+212698765432');

-- Insert some returns data  
INSERT INTO public.returns (return_code, order_id, customer_id, return_type, status, reason_code, reason_description, return_value)
SELECT 
  'RET-' || LPAD(ROW_NUMBER() OVER()::TEXT, 6, '0') as return_code,
  o.id as order_id,
  cp.id as customer_id,
  'rto' as return_type,
  'received' as status,
  'client_injoignable' as reason_code,
  'Client injoignable après plusieurs tentatives' as reason_description,
  o.order_total as return_value
FROM public.orders o
JOIN public.customer_profiles cp ON cp.phone = o.client_phone
WHERE o.status IN ('retournee')
LIMIT 3;

-- Insert financial transactions for sales
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
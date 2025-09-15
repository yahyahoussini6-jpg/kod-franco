-- Create sample return records for testing
-- First, let's create a function to generate return codes
CREATE OR REPLACE FUNCTION generate_return_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'RET-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,8));
$$;

-- Insert sample return records based on existing orders
INSERT INTO returns (
  return_code,
  order_id,
  customer_id,
  return_type,
  status,
  reason_code,
  reason_description,
  return_value,
  refund_amount,
  handling_cost,
  created_at,
  updated_at
)
SELECT 
  generate_return_code(),
  o.id,
  (SELECT cp.id FROM customer_profiles cp WHERE cp.phone = o.client_phone LIMIT 1),
  CASE 
    WHEN o.status = 'retournee' THEN 'rto'
    WHEN o.status = 'annulee' THEN 'return'
    ELSE 'return'
  END,
  CASE 
    WHEN o.status = 'retournee' THEN 'received'
    WHEN o.status = 'annulee' THEN 'processed'
    ELSE 'initiated'
  END,
  CASE 
    WHEN o.status = 'retournee' THEN 'unreachable_customer'
    WHEN o.status = 'annulee' THEN 'customer_cancelled'
    ELSE 'defective_product'
  END,
  CASE 
    WHEN o.status = 'retournee' THEN 'Client injoignable lors de la livraison'
    WHEN o.status = 'annulee' THEN 'Client a annulé la commande'
    ELSE 'Produit défectueux signalé par le client'
  END,
  o.order_total,
  CASE 
    WHEN o.status = 'annulee' THEN o.order_total
    ELSE 0
  END,
  CASE 
    WHEN o.status = 'retournee' THEN 50
    ELSE 0
  END,
  o.created_at + interval '2 days',
  now()
FROM orders o
WHERE o.status IN ('retournee', 'annulee') OR random() < 0.1
LIMIT 15;

-- Create some additional sample returns for different statuses
INSERT INTO returns (
  return_code,
  order_id,
  customer_id,
  return_type,
  status,
  reason_code,
  reason_description,
  return_value,
  refund_amount,
  handling_cost,
  received_at,
  processed_at,
  created_at,
  updated_at
)
SELECT 
  generate_return_code(),
  o.id,
  (SELECT cp.id FROM customer_profiles cp WHERE cp.phone = o.client_phone LIMIT 1),
  'exchange',
  'refunded',
  'size_issue',
  'Problème de taille, échange demandé',
  o.order_total,
  o.order_total,
  25,
  now() - interval '1 day',
  now() - interval '12 hours',
  o.created_at + interval '3 days',
  now()
FROM orders o
WHERE o.status = 'livree'
ORDER BY random()
LIMIT 5;

-- Add some in-transit returns
INSERT INTO returns (
  return_code,
  order_id,
  customer_id,
  return_type,
  status,
  reason_code,
  reason_description,
  return_value,
  handling_cost,
  created_at,
  updated_at
)
SELECT 
  generate_return_code(),
  o.id,
  (SELECT cp.id FROM customer_profiles cp WHERE cp.phone = o.client_phone LIMIT 1),
  'return',
  'in_transit',
  'wrong_item',
  'Article reçu ne correspond pas à la commande',
  o.order_total,
  30,
  o.created_at + interval '5 days',
  now()
FROM orders o
WHERE o.status = 'livree'
ORDER BY random()
LIMIT 3;
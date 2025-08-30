-- Fix the trigger function first
DROP TRIGGER IF EXISTS auto_create_customer_profile ON public.orders;
DROP FUNCTION IF EXISTS create_customer_profile_from_order();

-- Create the corrected function that matches the actual orders table structure
CREATE OR REPLACE FUNCTION create_customer_profile_from_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if customer profile already exists for this phone
    IF NOT EXISTS (SELECT 1 FROM public.customer_profiles WHERE phone = NEW.client_phone) THEN
        INSERT INTO public.customer_profiles (
            phone,
            full_name,
            city,
            address
        ) VALUES (
            NEW.client_phone,
            NEW.client_nom,
            NEW.client_ville,
            NEW.client_adresse
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER auto_create_customer_profile
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION create_customer_profile_from_order();

-- Now insert the sample data
INSERT INTO public.products (nom, description, prix, en_stock, slug) VALUES
('T-Shirt Premium', 'T-shirt en coton bio de haute qualité', 199.00, true, 't-shirt-premium'),
('Hoodie Classique', 'Sweat à capuche confortable pour toutes saisons', 399.00, true, 'hoodie-classique'),
('Jean Slim', 'Jean coupe slim moderne et tendance', 499.00, true, 'jean-slim'),
('Baskets Sport', 'Chaussures de sport performantes', 799.00, true, 'baskets-sport'),
('Sac à Dos', 'Sac à dos pratique et résistant', 299.00, true, 'sac-a-dos')
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants
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
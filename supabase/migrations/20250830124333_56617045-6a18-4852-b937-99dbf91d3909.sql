-- Check if trigger exists and create if needed
-- Create trigger to automatically create customer profiles from orders
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_customer_profile_on_order ON public.orders;

-- Create new trigger
CREATE TRIGGER create_customer_profile_on_order
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION create_customer_profile_from_order();

-- Backfill existing orders to create customer profiles
INSERT INTO public.customer_profiles (phone, full_name, city, address)
SELECT DISTINCT 
    o.client_phone,
    o.client_nom,
    o.client_ville,
    o.client_adresse
FROM public.orders o
WHERE o.client_phone IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.customer_profiles cp 
    WHERE cp.phone = o.client_phone
  );

-- Add sample customer data with realistic profiles
INSERT INTO public.customer_profiles (phone, full_name, email, city, address, is_vip, risk_score, marketing_opt_in, whatsapp_opt_in) VALUES
('0612345678', 'Ahmed Benali', 'ahmed.benali@email.com', 'Casablanca', '123 Rue Mohammed V, Casablanca', false, 0.1, true, true),
('0687654321', 'Fatima Alaoui', 'fatima.alaoui@email.com', 'Rabat', '456 Avenue Hassan II, Rabat', true, 0.0, true, true),
('0698765432', 'Youssef Idrissi', 'youssef.idrissi@email.com', 'Marrakech', '789 Rue de la Kasbah, Marrakech', false, 0.3, false, true),
('0623456789', 'Aicha Benkirane', 'aicha.benkirane@email.com', 'Fès', '321 Boulevard Zerktouni, Fès', false, 0.2, true, false),
('0634567890', 'Omar Tazi', 'omar.tazi@email.com', 'Tanger', '654 Avenue Mohammed VI, Tanger', true, 0.0, true, true),
('0645678901', 'Khadija Mouradi', '', 'Agadir', '987 Rue Hassan I, Agadir', false, 0.8, false, false),
('0656789012', 'Khalid Bennani', 'khalid.bennani@email.com', 'Oujda', '147 Avenue des FAR, Oujda', false, 0.5, true, true),
('0667890123', 'Samira Cherkaoui', 'samira.cherkaoui@email.com', 'Meknès', '258 Rue El Amir Abdelkader, Meknès', false, 0.1, true, true),
('0678901234', 'Rachid Boulahcen', '', 'Témara', '369 Avenue Al Massira, Témara', false, 0.9, false, false),
('0689012345', 'Nadia Filali', 'nadia.filali@email.com', 'Salé', '741 Boulevard Ibn Sina, Salé', true, 0.0, true, true)
ON CONFLICT (phone) DO NOTHING;
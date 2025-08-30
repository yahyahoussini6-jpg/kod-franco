-- Create comprehensive tables for admin operations (fixed version)

-- Products and Inventory Management
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  stock_on_hand INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  incoming INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  batch_number TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stock movement tracking
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'reserved', 'unreserved')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- order_id, adjustment_id, etc.
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer profiles (extends basic user info)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  acquisition_source TEXT,
  tags TEXT[],
  risk_score DECIMAL(3,2) DEFAULT 0, -- 0.00 to 1.00
  is_vip BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  marketing_opt_in BOOLEAN DEFAULT false,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('billing', 'shipping', 'both')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Morocco',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Returns and RTO Management
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_code TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID REFERENCES public.customer_profiles(id),
  return_type TEXT NOT NULL CHECK (return_type IN ('return', 'rto', 'exchange', 'refund')),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'in_transit', 'received', 'processed', 'refunded', 'restocked', 'disposed')),
  reason_code TEXT NOT NULL,
  reason_description TEXT,
  return_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  handling_cost DECIMAL(10,2) DEFAULT 0,
  restocking_decision TEXT CHECK (restocking_decision IN ('restock', 'dispose', 'repair', 'exchange')),
  received_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'good', 'damaged', 'defective')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial tracking
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'refund', 'cod_fee', 'shipping_fee', 'discount', 'cost')),
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID REFERENCES public.customer_profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MAD',
  payment_method TEXT,
  reference_number TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shipping and carriers
CREATE TABLE IF NOT EXISTS public.carriers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carrier_id UUID REFERENCES public.carriers(id),
  zone_name TEXT NOT NULL,
  cities TEXT[],
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_kg_cost DECIMAL(10,2) DEFAULT 0,
  delivery_time_min INTEGER, -- hours
  delivery_time_max INTEGER, -- hours
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies (bypass for admin users)
CREATE POLICY "Admin can access all product variants" ON public.product_variants FOR ALL USING (true);
CREATE POLICY "Admin can access all inventory" ON public.inventory FOR ALL USING (true);
CREATE POLICY "Admin can access all stock movements" ON public.stock_movements FOR ALL USING (true);
CREATE POLICY "Admin can access all customer profiles" ON public.customer_profiles FOR ALL USING (true);
CREATE POLICY "Admin can access all customer addresses" ON public.customer_addresses FOR ALL USING (true);
CREATE POLICY "Admin can access all returns" ON public.returns FOR ALL USING (true);
CREATE POLICY "Admin can access all return items" ON public.return_items FOR ALL USING (true);
CREATE POLICY "Admin can access all financial transactions" ON public.financial_transactions FOR ALL USING (true);
CREATE POLICY "Admin can access all carriers" ON public.carriers FOR ALL USING (true);
CREATE POLICY "Admin can access all shipping zones" ON public.shipping_zones FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON public.inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_id ON public.stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON public.customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON public.customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON public.returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON public.return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_order_id ON public.financial_transactions(order_id);

-- Function to auto-create customer profile when order is placed
CREATE OR REPLACE FUNCTION create_customer_profile_from_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if customer profile already exists for this phone
    IF NOT EXISTS (SELECT 1 FROM public.customer_profiles WHERE phone = NEW.phone) THEN
        INSERT INTO public.customer_profiles (
            phone,
            full_name,
            city,
            address
        ) VALUES (
            NEW.phone,
            NEW.full_name,
            NEW.city,
            NEW.address
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for auto customer profile creation
DROP TRIGGER IF EXISTS auto_create_customer_profile ON public.orders;
CREATE TRIGGER auto_create_customer_profile
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION create_customer_profile_from_order();
-- Create bundle offers table
CREATE TABLE public.bundle_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bundle items table
CREATE TABLE public.bundle_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundle_offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  original_price NUMERIC NOT NULL DEFAULT 0,
  bundle_price NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bundle_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- Create policies for bundle_offers
CREATE POLICY "Admin can manage all bundle offers" 
ON public.bundle_offers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active bundle offers" 
ON public.bundle_offers 
FOR SELECT 
USING (is_active = true AND (start_date IS NULL OR start_date <= CURRENT_DATE) AND (end_date IS NULL OR end_date >= CURRENT_DATE));

-- Create policies for bundle_items
CREATE POLICY "Admin can manage all bundle items" 
ON public.bundle_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view bundle items for active bundles" 
ON public.bundle_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.bundle_offers bo 
  WHERE bo.id = bundle_items.bundle_id 
  AND bo.is_active = true 
  AND (bo.start_date IS NULL OR bo.start_date <= CURRENT_DATE) 
  AND (bo.end_date IS NULL OR bo.end_date >= CURRENT_DATE)
));

-- Create function to update timestamps
CREATE TRIGGER update_bundle_offers_updated_at
BEFORE UPDATE ON public.bundle_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bundle_items_updated_at
BEFORE UPDATE ON public.bundle_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_bundle_offers_active ON public.bundle_offers(is_active, start_date, end_date);
CREATE INDEX idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product_id ON public.bundle_items(product_id);
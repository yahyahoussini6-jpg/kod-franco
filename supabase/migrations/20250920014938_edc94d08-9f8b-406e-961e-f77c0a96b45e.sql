-- Create bundle customizations table
CREATE TABLE public.bundle_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundle_offers(id) ON DELETE CASCADE,
  layout_type TEXT NOT NULL DEFAULT 'stacked' CHECK (layout_type IN ('stacked', 'grid', 'carousel')),
  theme TEXT NOT NULL DEFAULT 'default' CHECK (theme IN ('default', 'minimal', 'luxury', 'modern')),
  animations_enabled BOOLEAN NOT NULL DEFAULT true,
  shadows_enabled BOOLEAN NOT NULL DEFAULT true,
  gradients_enabled BOOLEAN NOT NULL DEFAULT true,
  spacing INTEGER NOT NULL DEFAULT 6 CHECK (spacing >= 2 AND spacing <= 24),
  border_radius INTEGER NOT NULL DEFAULT 12 CHECK (border_radius >= 0 AND border_radius <= 24),
  visible_sections JSONB NOT NULL DEFAULT '{
    "gallery": true,
    "pricing": true,
    "variants": true,
    "description": true,
    "benefits": true,
    "reviews": false,
    "related": false
  }'::jsonb,
  custom_css TEXT,
  custom_hero_text TEXT,
  custom_benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bundle_id)
);

-- Enable RLS
ALTER TABLE public.bundle_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage all bundle customizations" 
ON public.bundle_customizations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view bundle customizations for active bundles" 
ON public.bundle_customizations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM bundle_offers bo 
    WHERE bo.id = bundle_customizations.bundle_id 
      AND bo.is_active = true 
      AND (bo.start_date IS NULL OR bo.start_date <= CURRENT_DATE)
      AND (bo.end_date IS NULL OR bo.end_date >= CURRENT_DATE)
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_bundle_customizations_updated_at
  BEFORE UPDATE ON public.bundle_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default customizations for existing bundles
INSERT INTO public.bundle_customizations (bundle_id)
SELECT id FROM public.bundle_offers
ON CONFLICT (bundle_id) DO NOTHING;
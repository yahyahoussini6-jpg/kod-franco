-- Create upsell and cross-sell relationships table
CREATE TABLE public.product_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  related_product_id UUID NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('upsell', 'cross_sell')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, related_product_id, relationship_type)
);

-- Enable RLS
ALTER TABLE public.product_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can manage product relationships" 
ON public.product_relationships 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view product relationships" 
ON public.product_relationships 
FOR SELECT 
USING (true);

-- Add indexes for performance
CREATE INDEX idx_product_relationships_product_id ON public.product_relationships(product_id);
CREATE INDEX idx_product_relationships_related_product_id ON public.product_relationships(related_product_id);
CREATE INDEX idx_product_relationships_type ON public.product_relationships(relationship_type);

-- Add trigger for updated_at
CREATE TRIGGER update_product_relationships_updated_at
BEFORE UPDATE ON public.product_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
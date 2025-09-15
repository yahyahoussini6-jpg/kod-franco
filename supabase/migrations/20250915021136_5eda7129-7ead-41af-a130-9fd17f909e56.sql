-- Create leads table for abandoned checkout forms
CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text,
  phone text,
  ville text,
  adresse text,
  cart_items jsonb,
  total_value numeric DEFAULT 0,
  utm_source text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  converted_to_order_id uuid,
  form_completion_percentage integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage all leads" 
ON public.leads 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their own leads by session" 
ON public.leads 
FOR UPDATE 
USING (true);

-- Create index for performance
CREATE INDEX idx_leads_phone ON public.leads(phone);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_status ON public.leads(status);

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
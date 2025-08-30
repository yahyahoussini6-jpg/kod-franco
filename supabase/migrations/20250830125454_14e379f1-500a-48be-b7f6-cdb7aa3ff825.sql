-- Create the missing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customer_profiles(id),
  order_id UUID REFERENCES public.orders(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0.20,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  currency TEXT NOT NULL DEFAULT 'MAD',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Admin can access all invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for invoice items  
CREATE POLICY "Admin can access all invoice items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
         LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1)::TEXT, 4, '0')
  FROM public.invoices
  WHERE invoice_number ~ '^INV-[0-9]{4}-[0-9]+$'
  AND EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE);
$$;

-- Create trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invoice_number();

-- Create trigger to update timestamps
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to calculate invoice item totals
CREATE OR REPLACE FUNCTION public.calculate_invoice_item_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total_price := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_invoice_item_total_trigger
  BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_invoice_item_total();

-- Create trigger to update invoice totals when items change
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_id_to_update UUID;
BEGIN
  -- Determine which invoice to update
  IF TG_OP = 'DELETE' THEN
    invoice_id_to_update := OLD.invoice_id;
  ELSE
    invoice_id_to_update := NEW.invoice_id;
  END IF;
  
  -- Update invoice totals
  UPDATE public.invoices
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM public.invoice_items
      WHERE invoice_id = invoice_id_to_update
    ),
    updated_at = now()
  WHERE id = invoice_id_to_update;
  
  -- Update tax and total amounts
  UPDATE public.invoices
  SET 
    tax_amount = subtotal * tax_rate,
    total_amount = subtotal + (subtotal * tax_rate) - discount_amount
  WHERE id = invoice_id_to_update;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();
-- Create a policy to allow public access to orders when querying by tracking code via RPC
CREATE POLICY "Public can track orders via RPC"
ON public.orders
FOR SELECT
TO public
USING (true);

-- Update the get_order_by_tracking function to be SECURITY DEFINER
-- This allows the function to bypass RLS and access order data for tracking
DROP FUNCTION IF EXISTS public.get_order_by_tracking(text);

CREATE OR REPLACE FUNCTION public.get_order_by_tracking(p_code text)
RETURNS TABLE(code_suivi text, statut text, created_at timestamp with time zone, items jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  return query
  select o.code_suivi, o.statut, o.created_at,
         coalesce(jsonb_agg(jsonb_build_object(
           'product_nom', oi.product_nom,
           'product_prix', oi.product_prix,
           'quantite', oi.quantite
         )) filter (where oi.id is not null), '[]'::jsonb)
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where o.code_suivi = p_code
  group by o.id;
end;
$$;
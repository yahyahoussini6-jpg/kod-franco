-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Public can track orders via RPC" ON public.orders;

-- The get_order_by_tracking function is already SECURITY DEFINER, 
-- so it can access orders table even with restrictive RLS policies.
-- This is the secure approach for public order tracking.

-- Let's also add better error handling to the function
CREATE OR REPLACE FUNCTION public.get_order_by_tracking(p_code text)
RETURNS TABLE(code_suivi text, statut text, created_at timestamp with time zone, items jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  -- Validate input
  IF p_code IS NULL OR trim(p_code) = '' THEN
    RETURN;
  END IF;

  return query
  select o.code_suivi, o.statut, o.created_at,
         coalesce(jsonb_agg(jsonb_build_object(
           'product_nom', oi.product_nom,
           'product_prix', oi.product_prix,
           'quantite', oi.quantite
         )) filter (where oi.id is not null), '[]'::jsonb) as items
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where upper(trim(o.code_suivi)) = upper(trim(p_code))
  group by o.id, o.code_suivi, o.statut, o.created_at;
end;
$$;
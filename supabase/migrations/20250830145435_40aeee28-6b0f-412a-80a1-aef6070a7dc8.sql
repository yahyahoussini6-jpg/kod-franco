-- Fix the get_order_by_tracking function to use correct column name 'status' instead of 'statut'
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
  select o.code_suivi, o.status as statut, o.created_at,
         coalesce(jsonb_agg(jsonb_build_object(
           'product_nom', oi.product_nom,
           'product_prix', oi.product_prix,
           'quantite', oi.quantite
         )) filter (where oi.id is not null), '[]'::jsonb) as items
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where upper(trim(o.code_suivi)) = upper(trim(p_code))
  group by o.id, o.code_suivi, o.status, o.created_at;
end;
$$;
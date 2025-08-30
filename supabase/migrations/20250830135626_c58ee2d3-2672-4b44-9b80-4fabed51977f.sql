-- Update the place_order function to handle product variables
CREATE OR REPLACE FUNCTION public.place_order(p_client jsonb, p_items jsonb)
 RETURNS TABLE(order_id uuid, code_suivi text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_order_id uuid;
begin
  if coalesce(p_client->>'nom','') = '' or
     coalesce(p_client->>'phone','') = '' or
     coalesce(p_client->>'ville','') = '' or
     coalesce(p_client->>'adresse','') = '' then
    raise exception 'Champs client requis manquants';
  end if;

  insert into public.orders (client_nom, client_phone, client_ville, client_adresse, utm_source)
  values (
    p_client->>'nom',
    p_client->>'phone',
    p_client->>'ville',
    p_client->>'adresse',
    nullif(p_client->>'utm_source','')
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_nom, product_prix, quantite, variables)
  select
    v_order_id,
    nullif(i->>'product_id','')::uuid,
    i->>'product_nom',
    (i->>'product_prix')::numeric,
    greatest(1, coalesce((i->>'quantite')::int,1)),
    coalesce(i->'variables', '{}'::jsonb)
  from jsonb_array_elements(p_items) as i;

  return query select o.id, o.code_suivi from public.orders o where o.id = v_order_id;
end;
$function$;
-- Extensions
create extension if not exists pgcrypto;

-- Produits
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nom text not null,
  description text,
  prix numeric(10,2) not null check (prix >= 0),
  en_stock boolean not null default true,
  media jsonb not null default '[]', -- ex: [{ "type":"image"|"video"|"model3d", "url":"..." }]
  created_at timestamptz not null default now()
);

-- Commandes
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code_suivi text unique not null default make_tracking_code(),
  client_nom text not null,
  client_phone text not null,
  client_ville text not null,
  client_adresse text not null,
  statut text not null default 'NOUVELLE'
    check (statut in ('NOUVELLE','CONFIRMÉE','EN_PRÉPARATION','EXPÉDIÉE','LIVRÉE','ANNULÉE','RETOURNÉE')),
  utm_source text,
  created_at timestamptz not null default now()
);

-- Lignes de commande
create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_nom text not null,
  product_prix numeric(10,2) not null,
  quantite int not null check (quantite > 0)
);

-- Code de suivi TRK-XXXXXXXX
create or replace function public.make_tracking_code()
returns text language sql as $$
  select 'TRK-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,8));
$$;

-- RPC: créer une commande (COD)
create or replace function public.place_order(p_client jsonb, p_items jsonb)
returns table (order_id uuid, code_suivi text)
language plpgsql security definer set search_path = public as $$
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

  insert into public.order_items (order_id, product_id, product_nom, product_prix, quantite)
  select
    v_order_id,
    nullif(i->>'product_id','')::uuid,
    i->>'product_nom',
    (i->>'product_prix')::numeric,
    greatest(1, coalesce((i->>'quantite')::int,1))
  from jsonb_array_elements(p_items) as i;

  return query select o.id, o.code_suivi from public.orders o where o.id = v_order_id;
end;
$$;

-- RPC: récupérer une commande par code de suivi
create or replace function public.get_order_by_tracking(p_code text)
returns table (
  code_suivi text,
  statut text,
  created_at timestamptz,
  items jsonb
)
language plpgsql security definer set search_path = public as $$
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

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Politiques
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'Produits publics') then
    create policy "Produits publics" on public.products
      for select to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where polname = 'Insert commandes via RPC') then
    create policy "Insert commandes via RPC" on public.orders
      for insert to anon, authenticated with check (true);
  end if;

  if not exists (select 1 from pg_policies where polname = 'Insert items via RPC') then
    create policy "Insert items via RPC" on public.order_items
      for insert to anon, authenticated with check (true);
  end if;
end $$;
-- Créer le type enum pour les rôles
create type public.app_role as enum ('admin', 'user');

-- Table des profils utilisateur
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- Table des rôles utilisateur
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Activer RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- Fonction sécurisée pour vérifier les rôles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Fonction pour obtenir le rôle utilisateur
create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = _user_id
  limit 1
$$;

-- Policies pour profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Policies pour user_roles
create policy "Users can view own roles" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "Admins can manage all roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'));

-- Fonction pour créer un profil automatiquement
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer 
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  
  -- Assigner le rôle user par défaut
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Trigger pour créer le profil automatiquement
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Mettre à jour les policies des produits pour les admins
drop policy if exists "Produits publics" on public.products;
create policy "Public can view products" on public.products
  for select using (true);

create policy "Admins can manage products" on public.products
  for all using (public.has_role(auth.uid(), 'admin'));

-- Policies pour voir les commandes (admins seulement)
create policy "Admins can view all orders" on public.orders
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update orders" on public.orders
  for update using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can view all order items" on public.order_items
  for select using (public.has_role(auth.uid(), 'admin'));
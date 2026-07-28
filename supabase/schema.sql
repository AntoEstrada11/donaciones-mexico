-- Ejecutar en Supabase SQL Editor (Dashboard → SQL)
-- Auth = Supabase Auth | Perfiles = tabla profiles | Contacto CRM = Odoo (sync)

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  phone text,
  odoo_partner_id bigint,
  profile_complete boolean not null default false,
  street text,
  city text,
  state text,
  zip text,
  rfc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_unique unique (email),
  constraint profiles_phone_nonempty check (phone is null or length(trim(phone)) > 0)
);

-- Teléfono: varios NULL OK; valor no nulo debe ser único
create unique index if not exists profiles_phone_unique_idx
  on public.profiles (phone)
  where phone is not null;

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_odoo_partner_id_idx on public.profiles (odoo_partner_id);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert solo vía trigger (security definer)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

-- Donaciones ligadas al usuario autenticado
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  church_id text not null,
  church_name text,
  campaign_id text not null,
  campaign_name text,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'MXN',
  status text not null default 'pending'
    check (status in ('paid', 'pending', 'failed', 'cancelled')),
  method text not null check (method in ('spei', 'card')),
  payment_reference text,
  created_at timestamptz not null default now()
);

create index if not exists donations_user_id_idx on public.donations (user_id);
create index if not exists donations_created_at_idx on public.donations (created_at desc);

alter table public.donations enable row level security;

drop policy if exists "donations_select_own" on public.donations;
create policy "donations_select_own"
  on public.donations for select
  using (auth.uid() = user_id);

drop policy if exists "donations_insert_own" on public.donations;
create policy "donations_insert_own"
  on public.donations for insert
  with check (auth.uid() = user_id);

drop policy if exists "donations_update_own" on public.donations;
create policy "donations_update_own"
  on public.donations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

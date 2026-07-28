-- Migración: donaciones + referencia de pago
-- Si ya tienes la tabla donations, solo corre el ALTER al final.

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

alter table public.donations
  add column if not exists payment_reference text;

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

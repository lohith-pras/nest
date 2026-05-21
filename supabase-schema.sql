-- ──────────────────────────────────────────────────────────────
-- Roomy App — Supabase SQL Schema
-- Run this in your Supabase project: SQL Editor → New Query
-- ──────────────────────────────────────────────────────────────

-- 1. Units
create table if not exists public.units (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  created_at  timestamp with time zone default now()
);

-- 2. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  unit_id     uuid references public.units(id) on delete set null,
  avatar_url  text,
  created_at  timestamp with time zone default now()
);

-- 2. Expenses
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  description text not null,
  amount      numeric(10,2) not null,
  paid_by     uuid references public.profiles(id) on delete set null,
  unit_id     uuid references public.units(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','paid')),
  split_amount numeric(10,2),
  receipt_url text,
  created_at  timestamp with time zone default now()
);

-- Ensure new columns are added if the table already existed
alter table public.expenses add column if not exists split_amount numeric(10,2);
alter table public.expenses add column if not exists receipt_url text;

-- 3. Groceries
create table if not exists public.groceries (
  id          uuid primary key default gen_random_uuid(),
  item_name   text not null,
  quantity    text,
  is_checked  boolean not null default false,
  added_by    uuid references public.profiles(id) on delete set null,
  unit_id     uuid references public.units(id) on delete cascade,
  updated_at  timestamp with time zone default now()
);

-- 4. Events (calendar)
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date not null,
  time        time,
  note        text,
  added_by    uuid references public.profiles(id) on delete set null,
  unit_id     uuid references public.units(id) on delete cascade,
  created_at  timestamp with time zone default now()
);

-- 5. Interests (watchlist + places)
create table if not exists public.interests (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('watchlist','places')),
  title       text not null,
  description text,
  link        text,
  added_by    uuid references public.profiles(id) on delete set null,
  unit_id     uuid references public.units(id) on delete cascade,
  created_at  timestamp with time zone default now()
);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- ──────────────────────────────────────────────────────────────

alter table public.units     enable row level security;
alter table public.profiles  enable row level security;
alter table public.expenses  enable row level security;
alter table public.groceries enable row level security;
alter table public.events    enable row level security;
alter table public.interests enable row level security;

-- Units: authenticated users can only read their own unit.
-- We use a secure RPC (get_unit_by_invite_code) to allow finding a unit by code without exposing all codes.
drop policy if exists "units_select" on public.units;
drop policy if exists "units_insert" on public.units;
create policy "units_select" on public.units for select using (id = (select unit_id from public.profiles where id = auth.uid()));
create policy "units_insert" on public.units for insert with check (auth.role() = 'authenticated');

-- Secure RPC to look up a unit by invite code without exposing the whole table
create or replace function public.get_unit_by_invite_code(code text)
returns table (id uuid, name text)
language plpgsql
security definer
as $$
begin
  return query select u.id, u.name from public.units u where u.invite_code = code;
end;
$$;

-- Profiles: any authenticated user can read all, update only their own
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- All other tables: any authenticated user can read/write ONLY their shared apartment data
drop policy if exists "expenses_all" on public.expenses;
drop policy if exists "groceries_all" on public.groceries;
drop policy if exists "events_all" on public.events;
drop policy if exists "interests_all" on public.interests;
create policy "expenses_all"  on public.expenses  for all using (unit_id = (select unit_id from public.profiles where id = auth.uid()));
create policy "groceries_all" on public.groceries for all using (unit_id = (select unit_id from public.profiles where id = auth.uid()));
create policy "events_all"    on public.events    for all using (unit_id = (select unit_id from public.profiles where id = auth.uid()));
create policy "interests_all" on public.interests for all using (unit_id = (select unit_id from public.profiles where id = auth.uid()));

-- ──────────────────────────────────────────────────────────────
-- Enable Realtime for Groceries (for live sync feature)
-- ──────────────────────────────────────────────────────────────
-- In Supabase dashboard: Database → Replication → Add 'groceries' table
-- OR run:
-- alter publication supabase_realtime add table groceries;

-- ──────────────────────────────────────────────────────────────
-- Storage Buckets (Receipts)
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) 
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

drop policy if exists "Receipts are publicly accessible" on storage.objects;
create policy "Receipts are accessible by unit members" 
  on storage.objects for select 
  using (bucket_id = 'receipts' and auth.role() = 'authenticated');

drop policy if exists "Users can upload receipts" on storage.objects;
create policy "Users can upload receipts" 
  on storage.objects for insert 
  with check (bucket_id = 'receipts' and auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- Migrations (Ensure new columns exist on older databases)
-- ──────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists unit_id uuid references public.units(id) on delete set null;
alter table public.expenses add column if not exists unit_id uuid references public.units(id) on delete cascade;
alter table public.groceries add column if not exists unit_id uuid references public.units(id) on delete cascade;
alter table public.events add column if not exists unit_id uuid references public.units(id) on delete cascade;
alter table public.interests add column if not exists unit_id uuid references public.units(id) on delete cascade;

-- Schema cache should reload automatically.

-- ──────────────────────────────────────────────────────────────
-- Phase 1: DB Foundation — interests table TMDB columns
-- ──────────────────────────────────────────────────────────────
alter table public.interests add column if not exists tmdb_id text;
alter table public.interests add column if not exists media_type text check (media_type in ('movie', 'tv'));
alter table public.interests add column if not exists poster_path text;
alter table public.interests add column if not exists release_year integer;
alter table public.interests add column if not exists overview text;

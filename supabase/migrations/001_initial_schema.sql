-- Enable extensions
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ─── PROFILES TABLE ─────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- ─── CITIES REFERENCE TABLE ──────────────────────────────────────────────────
create table public.cities (
  id bigint generated always as identity primary key,
  city_name text not null,
  country_code text,
  liteapi_city_code text,
  search_text text generated always as (lower(city_name || ' ' || coalesce(country_code,''))) stored
);

-- ─── AIRPORTS REFERENCE TABLE ────────────────────────────────────────────────
create table public.airports (
  id bigint generated always as identity primary key,
  airport_name text not null,
  iata_code text not null,
  city text,
  country text,
  search_text text generated always as (lower(airport_name || ' ' || iata_code || ' ' || coalesce(city,''))) stored
);

-- ─── BOOKINGS TABLE ──────────────────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_type text not null check (booking_type in ('hotel','flight')),
  liteapi_booking_id text, -- null until confirmed
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','failed')),
  payment_status text not null default 'mock_paid' check (payment_status in ('mock_paid','refunded')),
  search_snapshot jsonb not null,
  offer_snapshot jsonb not null,
  guest_details jsonb not null,
  total_price numeric not null,
  currency text not null default 'USD',
  check_in date,       -- hotel only
  check_out date,      -- hotel only
  departure_date date, -- flight only
  return_date date,    -- flight only
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index cities_search_idx on public.cities using gin (search_text gin_trgm_ops);
create index airports_search_idx on public.airports using gin (search_text gin_trgm_ops);
create index bookings_user_idx on public.bookings(user_id);

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.cities enable row level security;
alter table public.airports enable row level security;

-- ─── POLICIES ────────────────────────────────────────────────────────────────
create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own bookings" on public.bookings for all using (auth.uid() = user_id);
create policy "public read cities" on public.cities for select using (true);
create policy "public read airports" on public.airports for select using (true);

-- ─── TRIGGER: AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

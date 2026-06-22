-- SIGMA app schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- profiles: one row per Privy user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text unique not null,
  email text,
  wallet_address text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_wallet_address_idx on public.profiles (wallet_address);

-- ---------------------------------------------------------------------------
-- trades: buy/sell activity log
-- ---------------------------------------------------------------------------
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token_mint text not null,
  side text not null check (side in ('buy', 'sell')),
  amount_in text,
  amount_out text,
  tx_signature text unique,
  created_at timestamptz not null default now()
);

create index if not exists trades_user_id_idx on public.trades (user_id);
create index if not exists trades_token_mint_idx on public.trades (token_mint);
create index if not exists trades_created_at_idx on public.trades (created_at desc);

-- ---------------------------------------------------------------------------
-- portfolio_snapshots: net worth history for profile chart
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  total_usd numeric not null default 0,
  sol_usd numeric not null default 0,
  tokens_usd numeric not null default 0,
  recorded_at timestamptz not null default now()
);

create index if not exists portfolio_snapshots_user_id_idx
  on public.portfolio_snapshots (user_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- custom_tokens: user-created tokens + R2 logo URL
-- ---------------------------------------------------------------------------
create table if not exists public.custom_tokens (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  mint_address text unique not null,
  name text not null,
  symbol text not null,
  logo_url text,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists custom_tokens_creator_id_idx on public.custom_tokens (creator_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for profiles
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
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
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Server API routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- Anon key is restricted until you add Privy-verified client policies.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.trades enable row level security;
alter table public.custom_tokens enable row level security;
alter table public.portfolio_snapshots enable row level security;

-- Public read for custom token listings (trending / browse pages)
create policy "Anyone can read custom tokens"
  on public.custom_tokens
  for select
  to anon, authenticated
  using (true);

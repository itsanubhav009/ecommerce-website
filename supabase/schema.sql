-- ===========================================================================
-- Spider Threads — Supabase schema
-- Run this ONCE in your Supabase project: Dashboard -> SQL Editor -> New query
-- -> paste -> Run.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- users
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  password    text not null,           -- bcrypt hash
  role        text not null default 'USER',
  phone       text default '',
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------- products
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  price       numeric not null default 0,
  stock       integer not null default 0,
  category    text default 'Apparel',
  images      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------- orders
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  user_name   text,
  items       jsonb not null default '[]'::jsonb,
  total       numeric not null default 0,
  phone       text,
  call_time   text,
  address     text,
  status      text not null default 'PENDING',   -- PENDING | CONFIRMED | REJECTED
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------- notifications
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  type        text default 'ORDER',
  message     text,
  order_id    uuid,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: enable on every table and add NO policies. The app
-- talks to the database with the SERVICE ROLE key, which bypasses RLS, so the
-- app keeps full access while the public anon key is denied everything. This
-- means your data can't be read or written directly from the browser.
-- ---------------------------------------------------------------------------
alter table public.users         enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded product images (public read so <img> works).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

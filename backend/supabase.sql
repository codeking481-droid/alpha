-- Alpha Agency — Supabase tables
-- Run in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID
create extension if not exists "pgcrypto";

-- Companies
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  status text default 'active',
  projects_count integer default 0,
  revenue decimal(10,2) default 0,
  last_activity timestamp,
  created_at timestamp default now()
);

-- Content
create table if not exists content (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  title text not null,
  format text default 'post',
  status text default 'draft',
  content text,
  words integer,
  created_at timestamp default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  name text,
  email text,
  status text default 'new',
  score integer default 0,
  created_at timestamp default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  content text,
  sent_at timestamp,
  replied boolean default false,
  created_at timestamp default now()
);

-- Replies
create table if not exists replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  content text,
  received_at timestamp,
  created_at timestamp default now()
);

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  total_billed decimal(10,2) default 0,
  status text default 'active',
  created_at timestamp default now()
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  amount decimal(10,2) not null,
  status text default 'draft',
  due_date date,
  paid_at timestamp,
  created_at timestamp default now()
);

-- Contracts
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  name text not null,
  amount decimal(10,2) not null,
  status text default 'draft',
  signed_at timestamp,
  created_at timestamp default now()
);

-- Access codes
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references auth.users(id),
  used boolean default false,
  created_at timestamp default now()
);

-- API Tokens (for team member access via API)
create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  token_key text unique not null,
  email text not null,
  name text,
  last_used timestamp,
  is_active boolean default true,
  created_at timestamp default now()
);

-- Team members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  role text default 'member',
  created_at timestamp default now()
);

-- Seed master codes (single-use, instant unlock)
insert into access_codes (code, used) values ('126213JESUSISKING', false) on conflict (code) do nothing;
insert into access_codes (code, used) values ('126213JESUS', false) on conflict (code) do nothing;

-- RLS — disable for now (add policies when auth live)
alter table companies disable row level security;
alter table content disable row level security;
alter table leads disable row level security;
alter table messages disable row level security;
alter table replies disable row level security;
alter table clients disable row level security;
alter table invoices disable row level security;
alter table contracts disable row level security;
alter table access_codes disable row level security;
alter table api_tokens disable row level security;
alter table team_members disable row level security;

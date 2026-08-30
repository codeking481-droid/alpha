-- Alpha Agency �?" Supabase tables
-- Run in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID
create extension if not exists "pgcrypto";

-- Companies (with dedup and outreach tracking)
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  owner_email text,
  niche text,
  location text,
  status text default 'new' check (status in ('new','contacted','replied','hot','closed_won','lost')),
  contacted_at timestamp,
  outreach_count integer default 0,
  last_outreach_at timestamp,
  created_at timestamp default now()
);

-- Unique indexes for dedup
create unique index if not exists idx_companies_domain on companies(domain) where domain is not null;
create unique index if not exists idx_companies_name_lower on companies(lower(name)) where name is not null;

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

-- Campaigns (generated content for companies)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  industry text,
  posts jsonb,
  youtube_scripts jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Sent emails (outreach tracking - Resend + Gmail)
create table if not exists sent_emails (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  to_email text not null,
  subject text not null,
  body text,
  provider text default 'resend' check (provider in ('resend','gmail')),
  resend_id text,
  gmail_message_id text,
  status text default 'sent' check (status in ('sent','delivered','bounced','opened','clicked')),
  sent_at timestamp default now(),
  created_at timestamp default now()
);

-- Replies (inbound email tracking)
create table if not exists replies (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  to_email text,
  subject text,
  body text,
  received_at timestamp,
  sentiment text default 'neutral' check (sentiment in ('interested','question','neutral','out_of_office')),
  is_read boolean default false,
  original_email_id uuid references sent_emails(id),
  gmail_id text unique,
  whatsapp_alerted boolean default false,
  whatsapp_alerted_at timestamp,
  hot_lead_alerted boolean default false,
  hot_lead_alerted_at timestamp,
  created_at timestamp default now()
);

alter table replies add column if not exists gmail_id text;
alter table replies add column if not exists whatsapp_alerted boolean default false;
alter table replies add column if not exists whatsapp_alerted_at timestamp;
alter table replies add column if not exists hot_lead_alerted boolean default false;
alter table replies add column if not exists hot_lead_alerted_at timestamp;
create unique index if not exists replies_gmail_id_key on replies(gmail_id) where gmail_id is not null;

-- Vault + Inbox columns (prompt: VAULT + INBOX TWO CARDS)
alter table companies add column if not exists user_id text;
-- If previous migration created user_id as uuid, convert to text for email TEXT storage (safe fallback)
do $$ begin
  if exists (select 1 from information_schema.columns where table_name='companies' and column_name='user_id' and data_type='uuid') then
    alter table companies alter column user_id type text using user_id::text;
  end if;
end $$;
alter table companies add column if not exists company_name text;
alter table companies add column if not exists owner_name text;
alter table companies add column if not exists owner_email text;
alter table companies add column if not exists product text;
alter table companies add column if not exists source text default 'apollo';
alter table companies add column if not exists website text;
alter table companies add column if not exists saved_at timestamp default now();
alter table companies add column if not exists is_real boolean default true;
alter table companies add column if not exists closed_won_at timestamp;
alter table companies add column if not exists amount decimal(10,2) default 0;
alter table companies add column if not exists updated_at timestamp;

-- Replies: user_id, company_id, followup columns
alter table replies add column if not exists user_id text;
do $$ begin
  if exists (select 1 from information_schema.columns where table_name='replies' and column_name='user_id' and data_type='uuid') then
    alter table replies alter column user_id type text using user_id::text;
  end if;
end $$;
alter table replies add column if not exists company_id uuid references companies(id) on delete set null;
alter table replies add column if not exists reply_text text;
alter table replies add column if not exists followup_message text;
alter table replies add column if not exists followup_status text check (followup_status in ('pending_approval','sent','rejected',null));
alter table replies add column if not exists followup_generated_at timestamp;
alter table replies add column if not exists followup_sent_at timestamp;
alter table replies add column if not exists followup_resend_id text;
alter table replies add column if not exists gmail_id text;
alter table replies add column if not exists sentiment text default 'neutral';

-- Leads cache (company search results) - prevents duplicate search results
create table if not exists leads_cache (
  id uuid primary key default gen_random_uuid(),
  niche text not null,
  domain text unique,
  data jsonb,
  created_at timestamp default now(),
  expires_at timestamp
);

-- Seed master codes (single-use, instant unlock)
insert into access_codes (code, used) values ('126213JESUSISKING', false) on conflict (code) do nothing;
insert into access_codes (code, used) values ('126213JESUS', false) on conflict (code) do nothing;

-- Fix messages schema for outreach tracking
alter table messages add column if not exists to_email text;
alter table messages add column if not exists subject text;
alter table messages add column if not exists html text;
alter table messages add column if not exists text text;
alter table messages add column if not exists resend_id text;

alter table companies add column if not exists hot_lead_alerted boolean default false;
alter table companies add column if not exists hot_lead_alerted_at timestamp;

-- Fix messages schema
alter table messages add column if not exists to_email text;
alter table messages add column if not exists subject text;
alter table messages add column if not exists html text;
alter table messages add column if not exists text text;
alter table messages add column if not exists resend_id text;
alter table companies add column if not exists hot_lead_alerted boolean default false;
alter table companies add column if not exists hot_lead_alerted_at timestamp;

-- Indexes for Vault + Inbox
create index if not exists idx_companies_user_id on companies(user_id);
create index if not exists idx_replies_user_id on replies(user_id);
create index if not exists idx_replies_company_id on replies(company_id);

-- RLS �?" disable for now (add policies when auth live)
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
alter table campaigns disable row level security;
alter table sent_emails disable row level security;
alter table leads_cache disable row level security;

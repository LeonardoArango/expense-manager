-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tenants Table
create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (Linked to Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  tenant_id uuid references public.tenants(id) on delete cascade
);

-- 3. Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  description text,
  status text check (status in ('active', 'archived')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Partners Table
create table public.partners (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  email text,
  profile_id uuid references public.profiles(id) on delete set null, -- Optional link to real user
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Project Partners Junction Table
create table public.project_partners (
  project_id uuid references public.projects(id) on delete cascade not null,
  partner_id uuid references public.partners(id) on delete cascade not null,
  equity_percentage numeric(5,2) not null check (equity_percentage >= 0 and equity_percentage <= 100),
  is_owner boolean default false,
  primary key (project_id, partner_id)
);

-- 6. Accounts Table
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  type text check (type in ('bank', 'wallet', 'credit_card', 'investment', 'cash')) not null,
  currency text default 'COP',
  credit_limit numeric(15,2),
  cutoff_day integer check (cutoff_day between 1 and 31),
  payment_day integer check (payment_day between 1 and 31),
  balance numeric(15,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  parent_id uuid references public.categories(id),
  type text check (type in ('income', 'expense')) not null,
  dian_code text,
  is_tax_deductible boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Recurring Transactions Transactions
create table public.recurring_transactions (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    description text not null,
    amount numeric(15,2),
    type text check (type in ('income', 'expense', 'transfer')) not null,
    frequency text check (frequency in ('monthly', 'yearly', 'weekly')),
    start_date date not null,
    next_due_date date,
    category_id uuid references public.categories(id),
    project_id uuid references public.projects(id),
    account_id uuid references public.accounts(id),
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Transactions Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  amount numeric(15,2) not null,
  description text not null,
  type text check (type in ('income', 'expense', 'transfer')) not null,
  status text check (status in ('pending', 'paid')) default 'paid',
  category_id uuid references public.categories(id),
  project_id uuid references public.projects(id),
  account_id uuid references public.accounts(id), -- Source of funds
  paid_by_partner_id uuid references public.partners(id), -- Who actually paid
  recurring_id uuid references public.recurring_transactions(id)
);

-- RLS Policies
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.partners enable row level security;
alter table public.project_partners enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;

-- Function to get current user's tenant_id
create or replace function get_auth_tenant_id()
returns uuid
language sql stable
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- Generic Policy for Tenant Isolation
create policy "Users can view their own tenant data" on public.tenants
  for select using (id = get_auth_tenant_id());

create policy "Users can view their own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());

-- Helper macro for other tables
-- We can't use macros in standard SQL, so we define policies explicitly for each table.

-- Projects
create policy "Tenant isolation for projects" on public.projects
  for all using (tenant_id = get_auth_tenant_id());

-- Partners
create policy "Tenant isolation for partners" on public.partners
  for all using (tenant_id = get_auth_tenant_id());

-- Project Partners (via Project)
create policy "Tenant isolation for project_partners" on public.project_partners
  for all using (
    project_id in (select id from public.projects where tenant_id = get_auth_tenant_id())
  );

-- Accounts
create policy "Tenant isolation for accounts" on public.accounts
  for all using (tenant_id = get_auth_tenant_id());

-- Categories
create policy "Tenant isolation for categories" on public.categories
  for all using (tenant_id = get_auth_tenant_id());

-- Transactions
create policy "Tenant isolation for transactions" on public.transactions
  for all using (tenant_id = get_auth_tenant_id());

-- Recurring Transactions
create policy "Tenant isolation for recurring_transactions" on public.recurring_transactions
  for all using (tenant_id = get_auth_tenant_id());

-- Trigger to create a default tenant and profile for new users (Optional but recommended)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  -- Create a new tenant for the user
  insert into public.tenants (name)
  values ('My Workspace')
  returning id into new_tenant_id;

  -- Create a profile linked to the user and tenant
  insert into public.profiles (id, full_name, tenant_id)
  values (new.id, new.raw_user_meta_data->>'full_name', new_tenant_id);

  return new;
end;
$$;

-- Trigger on auth.users
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

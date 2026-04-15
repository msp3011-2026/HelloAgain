-- HelloAgain Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)

-- ─────────────────────────────────────────────
-- Users (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text default '',
  phone text,
  city text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- Contacts (people A wants to reconnect with)
-- ─────────────────────────────────────────────
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  notes text default '',
  tier text check (tier in ('warm', 'friendly', 'keep_warm')) default 'friendly',
  last_interaction_date date,
  next_nudge_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, phone)
);

-- ─────────────────────────────────────────────
-- Contact profiles (B's data — shared across HelloAgain users)
-- ─────────────────────────────────────────────
create table if not exists public.contact_profiles (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  neighborhood text,
  dietary text,
  avoid_cuisine text[] default '{}',
  preferred_cuisine text[] default '{}',
  vibe text[] default '{}',
  price_range text,
  google_calendar_token text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- Meetups
-- ─────────────────────────────────────────────
create table if not exists public.meetups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  status text default 'initiated' check (status in (
    'initiated', 'whatsapp_sent', 'time_confirmed',
    'preferences_collected', 'venue_selected', 'reserved',
    'completed', 'cancelled'
  )),
  meal_type text check (meal_type in ('coffee', 'brunch', 'dinner')),
  scheduled_time timestamp with time zone,
  venue_name text,
  venue_address text,
  venue_url text,
  reservation_url text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- Blocked windows (A's unavailable periods)
-- ─────────────────────────────────────────────
create table if not exists public.blocked_windows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- Nudge log
-- ─────────────────────────────────────────────
create table if not exists public.nudge_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  sent_at timestamp with time zone default now(),
  action_taken text check (action_taken in ('sent', 'skipped', 'snoozed', 'pending'))
);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_profiles enable row level security;
alter table public.meetups enable row level security;
alter table public.blocked_windows enable row level security;
alter table public.nudge_log enable row level security;

-- Users
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- Contacts
create policy "contacts_all_own" on public.contacts for all using (auth.uid() = user_id);

-- Contact profiles (anyone authenticated can read; only service role writes)
create policy "contact_profiles_select" on public.contact_profiles for select using (auth.role() = 'authenticated');

-- Meetups
create policy "meetups_all_own" on public.meetups for all using (auth.uid() = user_id);

-- Blocked windows
create policy "blocks_all_own" on public.blocked_windows for all using (auth.uid() = user_id);

-- Nudge log
create policy "nudges_all_own" on public.nudge_log for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Auto-update updated_at timestamps
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger trg_contacts_updated_at
  before update on public.contacts
  for each row execute function update_updated_at();

create trigger trg_meetups_updated_at
  before update on public.meetups
  for each row execute function update_updated_at();

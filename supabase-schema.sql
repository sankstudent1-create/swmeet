-- ================================================
-- SWMEET DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ================================================

-- 1. PROFILES TABLE
-- Linked to auth.users via id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar text,
  role text not null default 'member' check (role in ('host', 'member')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: anyone can read profiles, users can update their own
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. MEETINGS TABLE
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled Meeting',
  host_id uuid references public.profiles(id) on delete set null,
  host_name text not null default '',
  start_time timestamptz not null default now(),
  duration_mins int not null default 30,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'ended')),
  code text unique not null,
  description text,
  recurring boolean default false,
  require_approval boolean default false,
  created_at timestamptz not null default now()
);

alter table public.meetings enable row level security;

-- Meetings are viewable by the host or anyone who is a participant
drop policy if exists "Meetings are viewable by host or participants" on public.meetings;
drop policy if exists "Meetings are viewable by everyone" on public.meetings; -- Drop the old version if it exists
create policy "Meetings are viewable by host or participants" on public.meetings for select using (
  auth.uid() = host_id or 
  exists (
    select 1 from public.meeting_participants mp 
    where mp.meeting_id = id and mp.user_id = auth.uid()
  )
);

drop policy if exists "Authenticated users can create meetings" on public.meetings;
create policy "Authenticated users can create meetings" on public.meetings for insert with check (auth.uid() is not null);

drop policy if exists "Hosts can update own meetings" on public.meetings;
create policy "Hosts can update own meetings" on public.meetings for update using (auth.uid() = host_id);

drop policy if exists "Hosts can delete own meetings" on public.meetings;
create policy "Hosts can delete own meetings" on public.meetings for delete using (auth.uid() = host_id);

-- 3. MEETING PARTICIPANTS (join table)
create table if not exists public.meeting_participants (
  meeting_id uuid references public.meetings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'participant' check (role in ('host', 'moderator', 'participant', 'waiting')),
  joined_at timestamptz default now(),
  primary key (meeting_id, user_id)
);

alter table public.meeting_participants enable row level security;

drop policy if exists "Participants viewable by everyone" on public.meeting_participants;
create policy "Participants viewable by everyone" on public.meeting_participants for select using (true);

drop policy if exists "Authenticated users can join meetings" on public.meeting_participants;
create policy "Authenticated users can join meetings" on public.meeting_participants for insert with check (auth.uid() is not null);

drop policy if exists "Hosts and Moderators can update participants" on public.meeting_participants;
create policy "Hosts and Moderators can update participants" on public.meeting_participants for update using (
  exists (
    select 1 from public.meeting_participants mp 
    where mp.meeting_id = meeting_participants.meeting_id 
    and mp.user_id = auth.uid() 
    and mp.role in ('host', 'moderator')
  )
  or
  exists (
    select 1 from public.meetings m
    where m.id = meeting_participants.meeting_id
    and m.host_id = auth.uid()
  )
);

drop policy if exists "Hosts and Moderators can delete participants" on public.meeting_participants;
create policy "Hosts and Moderators can delete participants" on public.meeting_participants for delete using (
  exists (
    select 1 from public.meeting_participants mp 
    where mp.meeting_id = meeting_participants.meeting_id 
    and mp.user_id = auth.uid() 
    and mp.role in ('host', 'moderator')
  )
  or
  exists (
    select 1 from public.meetings m
    where m.id = meeting_participants.meeting_id
    and m.host_id = auth.uid()
  )
);


-- 4. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- This function runs every time a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, avatar, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    null,
    'member'
  );
  return new;
end;
$$;

-- Drop the trigger if it exists, then create it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

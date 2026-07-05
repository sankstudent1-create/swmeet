-- Targeted migration for Waiting Rooms and Role-based Permissions
-- Run this in your Supabase SQL Editor if you are upgrading an existing database

-- 1. Add require_approval to meetings
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS require_approval boolean default false;

-- 2. Add role column to meeting_participants
-- First, drop the constraint if it exists (in case you are re-running)
ALTER TABLE public.meeting_participants DROP CONSTRAINT IF EXISTS meeting_participants_role_check;

ALTER TABLE public.meeting_participants 
ADD COLUMN IF NOT EXISTS role text not null default 'participant';

-- Re-add the constraint with the new values
ALTER TABLE public.meeting_participants 
ADD CONSTRAINT meeting_participants_role_check 
CHECK (role in ('host', 'moderator', 'participant', 'waiting'));

-- 3. Update the meetings visibility policy
DROP POLICY IF EXISTS "Meetings are viewable by everyone" ON public.meetings;
DROP POLICY IF EXISTS "Meetings are viewable by host or participants" ON public.meetings;

CREATE POLICY "Meetings are viewable by host or participants" ON public.meetings 
FOR SELECT USING (
  auth.uid() = host_id or 
  exists (
    select 1 from public.meeting_participants mp 
    where mp.meeting_id = id and mp.user_id = auth.uid()
  )
);

-- 4. Update the participants update/delete policies for hosts/moderators
DROP POLICY IF EXISTS "Hosts and Moderators can update participants" ON public.meeting_participants;
CREATE POLICY "Hosts and Moderators can update participants" ON public.meeting_participants 
FOR UPDATE USING (
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

DROP POLICY IF EXISTS "Hosts and Moderators can delete participants" ON public.meeting_participants;
CREATE POLICY "Hosts and Moderators can delete participants" ON public.meeting_participants 
FOR DELETE USING (
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

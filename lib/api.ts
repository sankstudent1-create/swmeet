import { supabase } from "./supabase";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "host" | "member";
};

export type Meeting = {
  id: string;
  title: string;
  host_id: string; // Changed to match snake_case DB
  host_name: string;
  start_time: string; // Changed to match snake_case DB
  duration_mins: number;
  status: "upcoming" | "live" | "ended";
  code: string; 
  description?: string;
  recurring?: boolean;
  require_approval?: boolean;
  participants?: User[]; // Joined from meeting_participants
};

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
    role: profile.role,
  };
}

export async function getMeetings(): Promise<Meeting[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  // Get meetings where user is host OR exists in meeting_participants
  const { data, error } = await supabase
    .from('meetings')
    .select('*, meeting_participants!inner(user_id)')
    .or(`host_id.eq.${session.user.id},meeting_participants.user_id.eq.${session.user.id}`)
    .order('start_time', { ascending: true });

  if (error || !data) {
    // fallback query without inner join if no participants yet
    const { data: hostData } = await supabase
      .from('meetings')
      .select('*')
      .eq('host_id', session.user.id)
      .order('start_time', { ascending: true });
    return hostData || [];
  }
  
  // Clean up the joined data for return
  return data.map(m => {
    const { meeting_participants, ...rest } = m;
    return rest as Meeting;
  });
}

export async function getMeetingById(idOrCode: string): Promise<Meeting | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
  const matchFilter = isUuid ? `id.eq.${idOrCode},code.eq.${idOrCode}` : `code.eq.${idOrCode}`;

  const { data, error } = await supabase
    .from('meetings')
    .select('*, meeting_participants(role, profiles(id, name, email, avatar))')
    .or(matchFilter)
    .maybeSingle();
    
  if (error || !data) return null;
  // map participants from the join table and include role
  const participants = data.meeting_participants?.map((mp: any) => ({
    ...mp.profiles,
    role: mp.role,
  })).filter((p: any) => p.id) || [];
  return { ...data, participants } as Meeting;
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase.from('meetings').select('*').eq('status', 'upcoming').order('start_time', { ascending: true });
  return data || [];
}

export async function getLiveMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase.from('meetings').select('*').eq('status', 'live').order('start_time', { ascending: false });
  return data || [];
}

export async function getPastMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase.from('meetings').select('*').eq('status', 'ended').order('start_time', { ascending: false });
  return data || [];
}

export async function getStats() {
  const { count: meetingsCount } = await supabase.from('meetings').select('*', { count: 'exact', head: true });
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  
  return {
    totalMeetings: meetingsCount || 0,
    totalHours: 187, // Mocked for now, requires complex aggregation
    totalContacts: usersCount || 0,
    uptime: "99.9%",
  };
}

export function generateMeetingCode() {
  const seg = () => Math.random().toString(36).slice(2, 6);
  return `swm-${seg()}-${seg()}`;
}

export async function signIn(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({ email, password });
  // Ensure profile exists (handles users created before trigger was set up)
  if (result.data?.user) {
    await ensureProfile(result.data.user);
  }
  return result;
}

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: { name }
    }
  });
  // If user was created (or already exists and got confirmed), ensure profile row
  if (data?.user) {
    await ensureProfile(data.user, name);
  }
  return { data, error };
}

async function ensureProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }, name?: string) {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single();
  if (!existing) {
    const displayName = name || (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'User';
    await supabase.from('profiles').insert({
      id: user.id,
      name: displayName,
      email: user.email || '',
      role: 'member',
    });
  }
}

export async function createMeeting(data: Partial<Meeting>) {
  const { data: newMeeting, error } = await supabase
    .from('meetings')
    .insert([data])
    .select()
    .single();
    
  if (error) throw error;
  
  // Add host as participant
  if (data.host_id) {
    await joinMeeting(newMeeting.id, data.host_id, 'host');
  }
  
  return newMeeting;
}

export async function joinMeeting(meetingId: string, userId: string, forceRole?: 'host' | 'moderator' | 'participant' | 'waiting') {
  // First check if meeting requires approval
  const { data: meeting } = await supabase.from('meetings').select('require_approval, host_id').eq('id', meetingId).single();
  if (!meeting) throw new Error("Meeting not found");
  
  let role = forceRole || 'participant';
  
  if (!forceRole) {
    if (meeting.host_id === userId) {
      role = 'host';
    } else if (meeting.require_approval) {
      role = 'waiting';
    }
  }

  const { error } = await supabase.from('meeting_participants').upsert(
    { meeting_id: meetingId, user_id: userId, role },
    { onConflict: 'meeting_id,user_id' }
  );
  
  if (error) throw error;
  return role;
}

export async function updateParticipantRole(meetingId: string, userId: string, role: 'host' | 'moderator' | 'participant' | 'waiting') {
  const { error } = await supabase
    .from('meeting_participants')
    .update({ role })
    .eq('meeting_id', meetingId)
    .eq('user_id', userId);
    
  if (error) throw error;
}

export async function removeParticipant(meetingId: string, userId: string) {
  const { error } = await supabase
    .from('meeting_participants')
    .delete()
    .eq('meeting_id', meetingId)
    .eq('user_id', userId);
    
  if (error) throw error;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getUpcomingMeetings,
  getLiveMeetings,
  getPastMeetings,
  getStats,
  type Meeting,
  type User,
} from "@/lib/api";
import { formatDate, formatRelative, formatTime } from "@/lib/format";
import {
  Video,
  PlusCircle,
  KeyRound,
  Clock,
  Users,
  Radio,
  Calendar,
  ChevronRight,
  Copy,
  ArrowRight,
  History
} from "lucide-react";
import Spinner from "@/components/Spinner";

function MeetingRow({ m, isLive = false, staggerIndex = 1 }: { m: Meeting; isLive?: boolean; staggerIndex?: number }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`https://swmeet.swinfosystems.online/meeting/${m.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Link
      href={`/meeting/${m.id}`}
      className={`animate-fade-in stagger-${staggerIndex} flex items-center justify-between gap-4 p-5 rounded-2xl bg-surface border hover:border-brand/30 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 ${isLive ? 'border-brand/40 animate-pulse-glow shadow-sm' : 'border-border'}`}
    >
      <div className="flex items-center gap-5 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
            isLive ? "bg-brand/10" : "bg-surface-2 group-hover:bg-brand/5"
          }`}
        >
          {isLive ? (
            <Radio size={22} className="text-brand" />
          ) : (
            <Calendar size={22} className="text-muted group-hover:text-brand transition-colors" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-lg truncate group-hover:text-brand transition-colors">{m.title}</p>
          <div className="flex items-center gap-3 text-sm text-muted mt-1">
            <span className="flex items-center gap-1.5"><Clock size={14} />{formatDate(m.start_time)} · {formatTime(m.start_time)}</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="hidden sm:inline font-medium text-foreground/70">{formatRelative(m.start_time)}</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="hidden sm:flex items-center gap-1.5"><Users size={14} /> {m.participants?.length || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Default State: Chevron / Status */}
      <div className="flex items-center gap-4 shrink-0 group-hover:hidden">
        {isLive && (
          <span className="text-xs font-bold uppercase tracking-widest text-brand bg-brand/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Live Now
          </span>
        )}
        <ChevronRight size={20} className="text-muted" />
      </div>

      {/* Hover State: Actions */}
      <div className="hidden group-hover:flex items-center gap-3 shrink-0 animate-fade-in">
        <button 
          onClick={copyLink}
          className="p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors tooltip"
          title="Copy invite link"
        >
          {copied ? <span className="text-xs font-semibold text-brand px-1">Copied!</span> : <Copy size={18} />}
        </button>
        <div className="h-6 w-px bg-border mx-1" />
        <span className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-4 py-2 rounded-lg shadow-sm">
          {isLive ? "Join Now" : "Enter Room"} <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [hour, setHour] = useState(new Date().getHours());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [live, setLive] = useState<Meeting[]>([]);
  const [past, setPast] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHour(new Date().getHours());
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setCurrentUser(user);
      
      const [u, l, p, s] = await Promise.all([
        getUpcomingMeetings(),
        getLiveMeetings(),
        getPastMeetings(),
        getStats()
      ]);
      setUpcoming(u);
      setLive(l);
      setPast(p);
      setStats(s);
      setLoading(false);
    }
    load();
  }, []);

  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (loading || !currentUser) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Mesh Header Area */}
      <div className="bg-mesh relative border-b border-border">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 pb-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
            <div>
              <p className="text-brand font-semibold text-sm tracking-widest uppercase mb-2">Welcome back</p>
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                {greeting}, <span className="gradient-text">{currentUser.name.split(" ")[0]}</span>
              </h1>
              <p className="text-muted mt-2 text-lg">Here&apos;s your command center for today&apos;s meetings.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/join"
                className="inline-flex items-center justify-center gap-2 glass text-foreground text-sm font-bold px-6 py-3 rounded-xl hover:bg-surface-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-border"
              >
                <KeyRound size={18} /> Join with code
              </Link>
              <Link
                href="/new-meeting"
                className="inline-flex items-center justify-center gap-2 bg-foreground text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-transparent"
              >
                <PlusCircle size={18} /> New meeting
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        {/* Stat cards - Glassmorphic */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total meetings", value: stats.totalMeetings, icon: Video, delay: 1 },
              { label: "Hours connected", value: stats.totalHours, icon: Clock, delay: 2 },
              { label: "Contacts", value: stats.totalContacts, icon: Users, delay: 3 },
              { label: "Uptime", value: stats.uptime, icon: Radio, delay: 4 },
            ].map((s) => (
              <div key={s.label} className={`animate-fade-in stagger-${s.delay} glass-panel rounded-2xl p-6 hover:-translate-y-1.5`}>
                <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-4">
                  <s.icon size={22} className="text-brand" />
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight">{s.value}</div>
                <div className="text-xs font-bold text-muted mt-1 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Live & Upcoming) */}
          <div className="lg:col-span-2 space-y-10">
            {live.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5 animate-fade-in">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
                  <h2 className="text-lg font-bold text-foreground">Live Now</h2>
                </div>
                <div className="space-y-4">
                  {live.map((m, i) => (
                    <MeetingRow key={m.id} m={m} isLive={true} staggerIndex={i + 1} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-5 animate-fade-in">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar size={20} className="text-muted" /> Upcoming Meetings
                </h2>
              </div>
              
              {upcoming.length === 0 ? (
                <div className="animate-fade-in bg-surface border border-dashed border-border/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={32} className="text-muted/50" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Your schedule is clear</h3>
                  <p className="text-muted text-sm mb-6 max-w-[250px]">No upcoming meetings scheduled. Time to focus or start something new!</p>
                  <Link href="/new-meeting" className="text-sm font-bold text-brand bg-brand/10 hover:bg-brand/20 px-5 py-2.5 rounded-lg transition-colors">
                    Schedule a meeting
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((m, i) => (
                    <MeetingRow key={m.id} m={m} staggerIndex={i + 1} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Recent Area */}
          <div>
            <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-in stagger-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                  <History size={16} /> Recent
                </h2>
                <Link href="/history" className="text-xs font-bold text-brand hover:underline">
                  View all
                </Link>
              </div>
              
              <div className="space-y-5">
                {past.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">No recent history.</p>
                ) : (
                  past.slice(0, 4).map((m) => (
                    <Link key={m.id} href={`/meeting/${m.id}`} className="group block">
                      <p className="font-semibold text-sm group-hover:text-brand transition-colors truncate">{m.title}</p>
                      <p className="text-xs text-muted mt-1">{formatDate(m.start_time)}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

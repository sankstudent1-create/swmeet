import Link from "next/link";
import { getMeetings } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format";
import { Clock, Users, Radio, Calendar, ChevronRight, Video } from "lucide-react";

export default async function HistoryPage() {
  const allMeetings = await getMeetings();
  const all = allMeetings.sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  return (
    <div className="min-h-screen pb-16">
      {/* Mesh Header Area */}
      <div className="bg-mesh relative border-b border-border">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 pb-16 relative z-10">
          <div className="animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-6 shadow-sm border border-border">
              <HistoryIcon size={24} className="text-brand" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Meeting <span className="gradient-text">History</span>
            </h1>
            <p className="text-muted mt-3 text-lg max-w-xl">A complete log of all your past conversations and upcoming scheduled events.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 animate-fade-in stagger-2">
          
          {all.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-6">
                <Video size={32} className="text-muted/50" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">No meetings yet</h3>
              <p className="text-muted text-sm max-w-sm mb-6">You haven't participated in any meetings. Schedule a new one to get started.</p>
              <Link href="/new-meeting" className="gradient-bg text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Schedule Meeting
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {all.map((m, i) => (
                <Link
                  key={m.id}
                  href={`/meeting/${m.id}`}
                  className={`flex items-center justify-between gap-4 p-5 rounded-2xl bg-surface border hover:border-brand/40 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 animate-fade-in stagger-${(i % 5) + 1} ${m.status === 'live' ? 'border-brand/30 shadow-sm' : 'border-border'}`}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${m.status === "live" ? "bg-brand/10" : m.status === "upcoming" ? "bg-surface-2 group-hover:bg-brand/10" : "bg-surface-2"}`}>
                      {m.status === "live" ? <Radio size={22} className="text-brand animate-pulse" /> : m.status === "upcoming" ? <Calendar size={22} className="text-brand" /> : <Clock size={22} className="text-muted group-hover:text-foreground transition-colors" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-lg truncate group-hover:text-brand transition-colors">{m.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted mt-1">
                        <span className="font-medium text-foreground/80">{formatDate(m.start_time)}</span>
                        <span className="text-border">•</span>
                        <span>{formatTime(m.start_time)}</span>
                        <span className="text-border hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1.5"><Users size={14} />{m.participants?.length || 0} participants</span>
                        <span className="text-border hidden sm:inline">•</span>
                        <span className="hidden sm:inline font-medium">{m.duration_mins} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${m.status === "live" ? "text-brand bg-brand/10" : m.status === "upcoming" ? "text-foreground bg-surface-2 border border-border" : "text-muted bg-surface-2"}`}>
                      {m.status}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2">
                      <ChevronRight size={16} className="text-brand" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Just a little helper icon component since lucide 'History' was clashing with HistoryPage name
function HistoryIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

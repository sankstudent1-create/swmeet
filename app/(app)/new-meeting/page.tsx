"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateMeetingCode, createMeeting, getCurrentUser, type User } from "@/lib/api";
import { copyToClipboard } from "@/lib/format";
import { Video, Calendar, Copy, Check, ArrowRight, Repeat, AlertCircle, Shield, Mail } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function NewMeetingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"instant" | "schedule">("instant");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [emails, setEmails] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fix hydration mismatch by generating code on client only
  useEffect(() => {
    setCode(generateMeetingCode());
    getCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });
  }, []);

  async function copyCode() {
    const success = await copyToClipboard(`${window.location.origin}/join/${code}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    setError("");
    
    try {
      await createMeeting({
        title: title || "Quick Sync",
        host_id: currentUser.id,
        host_name: currentUser.name,
        code,
        status: "live",
        start_time: new Date().toISOString(),
        require_approval: requireApproval,
      }, emails);
      router.push(`/meeting/${code}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create meeting");
      setLoading(false);
    }
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    setError("");
    
    try {
      const startTime = new Date(`${date}T${time}`).toISOString();
      await createMeeting({
        title,
        host_id: currentUser.id,
        host_name: currentUser.name,
        code,
        status: "upcoming",
        start_time: startTime,
        recurring,
        require_approval: requireApproval,
      }, emails);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to schedule meeting");
      setLoading(false);
    }
  }

  // Prevent rendering UI until client-side hydration completes and sets the code
  if (!code) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 animate-fade-in stagger-1">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">New meeting</h1>
        <p className="text-muted font-medium">Start instantly or schedule for later.</p>
      </div>

      <div className="flex gap-2 mx-auto bg-surface-2 border border-border/60 rounded-full p-1.5 w-fit shadow-sm">
        <button
          onClick={() => setMode("instant")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "instant" ? "bg-foreground text-white shadow-md" : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          Start instantly
        </button>
        <button
          onClick={() => setMode("schedule")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "schedule" ? "bg-foreground text-white shadow-md" : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          Schedule for later
        </button>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3 animate-fade-in">
          <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-danger">{error}</p>
        </div>
      )}

      {mode === "instant" ? (
        <form onSubmit={handleStart} className="glass-panel border border-border/80 rounded-[2rem] p-8 mt-8 space-y-6 shadow-xl relative overflow-hidden animate-fade-in stagger-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[100px] -mr-8 -mt-8" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center shadow-[0_8px_16px_var(--brand-20)] relative z-10">
            <Video size={30} className="text-white fill-white/20" />
          </div>
          
          <div className="relative z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Meeting title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick Sync"
              className="w-full bg-surface-2 border border-border rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>
          
          <div className="relative z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Your meeting link</label>
            <div className="flex items-center justify-between gap-3 bg-surface-2 border border-border rounded-2xl px-4 py-3.5">
              <span className="text-sm font-mono truncate font-medium text-foreground">{window.location.host}/join/{code}</span>
              <button type="button" onClick={copyCode} className="text-brand hover:text-brand-hover shrink-0 p-1 bg-brand/5 rounded-md hover:bg-brand/10 transition-colors">
                {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
          
          <div className="relative z-10 mt-6">
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Invite by Email (comma separated)</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="colleague@example.com, friend@test.com"
                className="w-full bg-surface-2 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
          </div>
          
          <label className="flex items-center gap-2.5 text-sm font-medium text-muted cursor-pointer w-fit hover:text-foreground transition-colors relative z-10 mt-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-muted rounded-md peer-checked:bg-brand peer-checked:border-brand transition-colors" />
              <Check size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
            </div>
            <Shield size={16} /> Require host approval to join (Waiting Room)
          </label>
          
          <button
            type="submit"
            disabled={loading || !currentUser}
            className="w-full bg-brand text-white font-bold py-4 rounded-2xl hover:bg-brand-hover shadow-[0_8px_20px_var(--brand-30)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:hover:transform-none disabled:cursor-not-allowed relative z-10"
          >
            {loading ? <Spinner className="w-5 h-5 text-white" /> : (
              <>Start meeting now <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSchedule} className="glass-panel border border-border/80 rounded-[2rem] p-8 mt-8 space-y-6 shadow-xl relative overflow-hidden animate-fade-in stagger-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] -mr-8 -mt-8" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-[0_8px_16px_rgba(168,85,247,0.2)] relative z-10">
            <Calendar size={30} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Meeting title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Roadmap Review"
              className="w-full bg-surface-2 border border-border rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>
          
          <div className="relative z-10">
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Invite by Email (comma separated)</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="colleague@example.com, friend@test.com"
                className="w-full bg-surface-2 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Date</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block pl-1">Time</label>
              <input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 relative z-10">
            <label className="flex items-center gap-2.5 text-sm font-medium text-muted cursor-pointer w-fit hover:text-foreground transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-muted rounded-md peer-checked:bg-brand peer-checked:border-brand transition-colors" />
                <Check size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              <Repeat size={16} /> Repeat weekly
            </label>

            <label className="flex items-center gap-2.5 text-sm font-medium text-muted cursor-pointer w-fit hover:text-foreground transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-muted rounded-md peer-checked:bg-brand peer-checked:border-brand transition-colors" />
                <Check size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              <Shield size={16} /> Require host approval to join (Waiting Room)
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading || !currentUser}
            className="w-full bg-foreground text-white font-bold py-4 rounded-2xl hover:bg-brand shadow-md transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:hover:transform-none disabled:cursor-not-allowed relative z-10"
          >
            {loading ? <Spinner className="w-5 h-5 text-white" /> : (
              <>Schedule meeting <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

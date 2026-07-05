"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, Settings2, Bell, ShieldAlert } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
        setName(user.name);
        setEmail(user.email);
      }
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    await supabase.from('profiles').update({ name }).eq('id', currentUser.id);
    // Also update email in auth if needed, but for now just profile
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!currentUser) {
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
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 pb-16 relative z-10">
          <div className="animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-6 shadow-sm border border-border">
              <Settings2 size={24} className="text-brand" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Account <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-muted mt-3 text-lg max-w-xl">Manage your profile, preferences, and account security.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Settings Column */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Profile Section */}
            <section className="glass-panel rounded-3xl p-6 sm:p-8 animate-fade-in stagger-1">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Settings2 size={20} className="text-muted" /> Profile Details
              </h2>
              
              <div className="flex items-center gap-5 mb-8 bg-surface-2 p-5 rounded-2xl border border-border">
                <div className="relative">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`} alt="" className="w-16 h-16 rounded-full shadow-md" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-surface flex items-center justify-center" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{name}</p>
                  <p className="text-sm font-medium text-muted">{email}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Full Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm" 
                  />
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="glass-panel rounded-3xl p-6 sm:p-8 animate-fade-in stagger-2">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Bell size={20} className="text-muted" /> Notifications
              </h2>
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="text-sm font-bold text-foreground">Meeting Reminders</p>
                    <p className="text-sm text-muted mt-1">Get an email notification 10 minutes before a scheduled meeting starts.</p>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-all duration-300 relative shrink-0 shadow-inner ${notifications ? "bg-brand" : "bg-border group-hover:bg-border/80"}`} onClick={() => setNotifications((v) => !v)}>
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${notifications ? "translate-x-7" : "translate-x-1"}`} />
                  </div>
                </label>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex items-center justify-end animate-fade-in stagger-3">
              <button 
                type="submit" 
                disabled={saving} 
                className="gradient-bg text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2 text-sm"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving Changes..." : saved ? "Changes Saved!" : "Save Changes"}
              </button>
            </div>

          </div>

          {/* Sidebar Settings Column */}
          <div className="md:col-span-4 space-y-6">
            <section className="glass-panel rounded-3xl p-6 border-danger/20 bg-danger/5 animate-fade-in stagger-4">
              <h2 className="font-bold text-danger mb-3 flex items-center gap-2">
                <ShieldAlert size={20} /> Danger Zone
              </h2>
              <p className="text-sm font-medium text-danger/80 mb-6 leading-relaxed">
                Permanently delete your account, including all your meeting history, settings, and personal data. This action cannot be undone.
              </p>
              <button type="button" className="w-full text-sm font-bold text-danger border-2 border-danger/20 bg-white hover:bg-danger hover:text-white hover:border-danger py-3 rounded-xl transition-all shadow-sm">
                Delete Account
              </button>
            </section>
          </div>

        </form>
      </div>
    </div>
  );
}

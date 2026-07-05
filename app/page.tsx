import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStats } from "@/lib/api";
import {
  Video,
  ShieldCheck,
  ScreenShare,
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";

const features = [
  { icon: Video, title: "HD Video & Audio", desc: "Crystal-clear calls that adapt to your network, automatically." },
  { icon: ScreenShare, title: "Screen Sharing", desc: "Share your screen, a window, or a tab in a single click." },
  { icon: MessageSquare, title: "Live Chat", desc: "Message participants during the call without breaking focus." },
  { icon: ShieldCheck, title: "Encrypted & Secure", desc: "End-to-end protections keep every meeting private by default." },
  { icon: Users, title: "Up to 100 Participants", desc: "From 1:1s to all-hands meetings, SwMeet scales with your team." },
  { icon: Sparkles, title: "Smart Scheduling", desc: "Recurring meetings, reminders, and calendar sync built in." },
];

const steps = [
  { n: "01", title: "Create a meeting", desc: "Start instantly or schedule for later in one click." },
  { n: "02", title: "Share the link", desc: "Send your unique meeting code or link to anyone." },
  { n: "03", title: "Join & connect", desc: "Participants join from any device, no installs needed." },
];


export default async function Home() {
  const stats = await getStats();
  
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-brand selection:text-white">
      <Navbar />

      {/* Hero Section with Mesh Background */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 bg-mesh">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
        
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <div className="animate-fade-in stagger-1 inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full glass text-brand mb-8 border border-brand/20 shadow-sm hover:shadow-md transition-shadow">
            <Zap size={14} className="animate-pulse" /> 
            <span>Premium WebRTC Edition</span>
          </div>
          
          <h1 className="animate-fade-in stagger-2 text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1.05] max-w-5xl mx-auto mb-6 text-foreground">
            Meetings that <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand via-brand-hover to-purple-600 animate-gradient-x drop-shadow-sm">actually work.</span>
          </h1>
          
          <p className="animate-fade-in stagger-3 text-muted text-lg md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Start secure HD video calls in seconds. No downloads, no friction, pure performance — welcome to SwMeet.
          </p>
          
          <div className="animate-fade-in stagger-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-brand text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-brand/30 hover:shadow-brand/50 hover:bg-foreground transform hover:-translate-y-1 transition-all duration-300"
            >
              <Video size={22} /> Enter Dashboard
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-2 glass border-border text-foreground text-lg font-bold px-8 py-4 rounded-2xl hover:bg-surface-2 transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Join a meeting <ArrowRight size={22} />
            </Link>
          </div>

          <div className="animate-fade-in stagger-5 grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-[2rem] border border-border shadow-xl backdrop-blur-xl">
            {[
              { label: "Meetings hosted", value: stats.totalMeetings + "k+" },
              { label: "Hours connected", value: stats.totalHours + "k+" },
              { label: "Active members", value: stats.totalContacts + "k+" },
              { label: "Global Uptime", value: stats.uptime },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col items-center p-4 hover:bg-surface-2/50 rounded-2xl transition-colors">
                <div className="text-4xl md:text-5xl font-black text-foreground mb-2 tracking-tight drop-shadow-sm">{s.value}</div>
                <div className="text-[11px] text-muted font-bold tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Mockup Section */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 -mt-16 pb-24 relative z-20">
        <div className="animate-fade-in stagger-6 bg-surface/80 backdrop-blur-3xl rounded-[2.5rem] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/60 transform hover:-translate-y-2 transition-transform duration-700">
          <div className="rounded-[2rem] bg-surface-2 aspect-video relative overflow-hidden flex items-center justify-center border border-border/80 group shadow-inner">
            <Image 
              src="/hero_mockup.png" 
              alt="SwMeet Interface Preview" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 text-sm font-bold text-white shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse shadow-[0_0_12px_var(--brand)]"></span>
              Live preview — Premium UI
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-32 relative">
        <div className="text-center max-w-2xl mx-auto mb-20 animate-fade-in">
          <h2 className="text-sm font-black text-brand tracking-widest uppercase mb-4">Features</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Everything you need to meet</h3>
          <p className="text-muted text-xl font-medium">Built for speed, security, and simplicity with a premium touch.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => (
            <div key={f.title} className={`animate-fade-in stagger-${(i % 5) + 1} bg-surface rounded-[2rem] p-8 border border-border hover:border-brand/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <div className="w-16 h-16 rounded-2xl bg-surface-2 text-brand flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand group-hover:text-white transition-colors duration-300 relative z-10">
                <f.icon size={28} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-foreground relative z-10">{f.title}</h4>
              <p className="text-muted leading-relaxed font-medium relative z-10">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 relative bg-surface-2 border-y border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-24 animate-fade-in">
            <h2 className="text-sm font-black text-brand tracking-widest uppercase mb-4">Workflow</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-6">How it works</h3>
            <p className="text-muted text-xl font-medium">Three simple steps to your next conversation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-brand/30 to-transparent -z-10" />
            
            {steps.map((s, i) => (
              <div key={s.n} className={`animate-fade-in stagger-${i+2} flex flex-col items-center text-center group`}>
                <div className="w-24 h-24 rounded-[2rem] bg-surface text-brand flex items-center justify-center text-3xl font-black mb-8 shadow-xl border-2 border-brand/20 group-hover:bg-brand group-hover:text-white group-hover:-translate-y-2 transition-all duration-500 group-hover:shadow-brand/20">
                  {s.n}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-foreground">{s.title}</h4>
                <p className="text-muted text-lg font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-40 text-center relative">
        <div className="absolute inset-0 bg-brand/5 blur-3xl rounded-full -z-10" />
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 drop-shadow-sm">Ready to meet smarter?</h2>
        <p className="text-muted text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium">
          Join thousands using SwMeet for daily standups, client calls, and team catch-ups. Open for testing right now.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 bg-foreground text-white text-xl font-bold px-12 py-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-brand hover:shadow-brand/30 transform hover:-translate-y-2 transition-all duration-300"
        >
          Enter Workspace <ArrowRight size={24} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}

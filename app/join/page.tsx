"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getMeetingById } from "@/lib/api";
import { KeyRound, ArrowRight, Loader2 } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    let finalCode = code.trim();
    if (!finalCode.startsWith('swm-') && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalCode)) {
      finalCode = 'swm-' + finalCode;
    }
    const meeting = await getMeetingById(finalCode);
    setLoading(false);
    if (!meeting) {
      setError("No meeting found with that code. Try again.");
      return;
    }
    router.push(`/meeting/${meeting.id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-surface-2 to-surface" />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-surface-2 text-brand flex items-center justify-center mb-4">
            <KeyRound size={22} />
          </div>
          <h1 className="text-xl font-bold">Join a meeting</h1>
          <p className="text-sm text-muted mt-1">Enter a meeting code or link to join.</p>

          <form onSubmit={handleJoin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Meeting code</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. swm-all-hands"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-muted/50"
              />
              <p className="text-[11px] text-muted mt-1.5">
                Try: <span className="font-mono">swm-all-hands</span> or{" "}
                <span className="font-mono">swm-prod-sync</span>
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Your name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-muted/50"
              />
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-foreground transition-all shadow-sm transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Joining..." : "Join meeting"}
            </button>
          </form>
        </div>
        <p className="text-sm text-muted text-center mt-6">
          <Link href="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

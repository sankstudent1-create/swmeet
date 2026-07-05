"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/api";
import Logo from "@/components/Logo";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      
      <div className="absolute top-8 left-8 z-20">
        <Logo size="md" />
      </div>
      
      <div className="w-full max-w-[420px] relative z-10 animate-fade-in stagger-2">
        <div className="glass-panel rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-border/80">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">Welcome back</h1>
            <p className="text-muted font-medium">Enter your details to access your meetings.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted pl-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Password</label>
                <Link href="#" className="text-xs font-bold text-brand hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-white font-bold py-4 rounded-2xl shadow-md hover:bg-brand hover:shadow-brand/30 transform hover:-translate-y-0.5 transition-all duration-300 mt-2 disabled:opacity-70 disabled:hover:transform-none disabled:hover:bg-foreground"
            >
              {loading ? <Spinner className="w-5 h-5 text-white" /> : (
                <>Sign in securely <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-muted mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

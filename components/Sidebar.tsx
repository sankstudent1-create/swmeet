"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { getCurrentUser, type User } from "@/lib/api";
import {
  LayoutGrid,
  History,
  Settings,
  PlusCircle,
  KeyRound,
  LogOut
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/new-meeting", label: "New meeting", icon: PlusCircle },
  { href: "/join", label: "Join meeting", icon: KeyRound },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => setCurrentUser(user));
  }, []);

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-surface flex-col h-screen sticky top-0 shadow-sm z-20">
      <div className="h-20 flex items-center px-6">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1.5">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                active
                  ? "text-brand bg-brand/5"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-full" />
              )}
              <l.icon size={18} className={`transition-colors ${active ? "text-brand" : "text-muted group-hover:text-foreground"}`} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 space-y-3">
        {/* Dark/Light mode toggle */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">Appearance</span>
          <ThemeToggle />
        </div>
        {currentUser ? (
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-surface-2 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center gap-3 min-w-0">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full ring-2 ring-background shadow-sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold truncate text-foreground">{currentUser.name}</p>
                <p className="text-[11px] font-medium text-muted truncate">{currentUser.email}</p>
              </div>
            </div>
            <button className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface-2 opacity-50">
            <div className="w-10 h-10 rounded-full bg-border animate-pulse" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3 bg-border rounded-full w-full animate-pulse" />
              <div className="h-2 bg-border rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

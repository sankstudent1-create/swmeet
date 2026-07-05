"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PlusCircle, KeyRound, History, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/new-meeting", label: "New", icon: PlusCircle },
  { href: "/join", label: "Join", icon: KeyRound },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border flex items-center justify-around py-2">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
              active ? "text-brand" : "text-muted"
            }`}
          >
            <l.icon size={20} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

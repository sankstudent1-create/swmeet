"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border border-border bg-surface-2 hover:bg-surface hover:shadow-md text-muted hover:text-foreground ${className}`}
    >
      <span className={`absolute transition-all duration-300 ${theme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"}`}>
        <Sun size={16} />
      </span>
      <span className={`absolute transition-all duration-300 ${theme === "light" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}`}>
        <Moon size={16} />
      </span>
    </button>
  );
}

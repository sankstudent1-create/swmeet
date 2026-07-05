import Link from "next/link";
import { Video } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Use on dark backgrounds (e.g. meeting room header) — forces white text */
  onDark?: boolean;
}

export default function Logo({ className = "", size = "md", onDark = false }: LogoProps) {
  const sizeClasses = {
    sm: "gap-1.5 text-lg",
    md: "gap-2 text-2xl",
    lg: "gap-3 text-4xl",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
  };

  const iconBox = size === "sm" ? "w-7 h-7 rounded-lg" : size === "md" ? "w-9 h-9 rounded-xl" : "w-12 h-12 rounded-2xl";

  return (
    <Link
      href="/"
      className={`flex items-center font-black tracking-tighter hover:opacity-80 transition-opacity ${sizeClasses[size]} ${className}`}
    >
      {/* Icon box */}
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand to-brand-2 text-white shadow-md ${iconBox}`}>
        <Video size={iconSizes[size]} strokeWidth={2.5} />
      </div>
      {/* Text */}
      <span className={onDark ? "text-white" : "text-foreground"}>
        SW<span className="text-brand">MEET</span>
      </span>
    </Link>
  );
}

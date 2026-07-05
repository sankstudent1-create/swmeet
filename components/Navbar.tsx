import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
          <Link href="/join" className="hover:text-foreground transition-colors">Join a meeting</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-bold bg-foreground text-white px-5 py-2.5 rounded-full hover:bg-brand transition-all shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

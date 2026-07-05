import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="text-sm text-muted mt-4 max-w-xs">
            Reliable, secure video meetings for teams and individuals — by Swinfosystems.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
            <li><Link href="/new-meeting" className="hover:text-foreground">New meeting</Link></li>
            <li><Link href="/join" className="hover:text-foreground">Join meeting</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="https://swcart.vercel.app" className="hover:text-foreground" target="_blank" rel="noreferrer">Swcart</a></li>
            <li><a href="#" className="hover:text-foreground">About Swinfosystems</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © 2026 SwMeet by Swinfosystems. All rights reserved.
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallets", label: "Wallets" },
  { href: "/reports", label: "Reports" }
];

export default function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <Shell className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Shared Wallet
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "px-3 py-2")}> 
            Log in
          </Link>
          <Link href="/register" className={cn(buttonVariants(), "px-3 py-2")}> 
            Sign up
          </Link>
        </div>
      </Shell>
    </header>
  );
}

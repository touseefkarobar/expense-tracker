import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/layout/shell";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { logoutUser } from "@/lib/server/auth-actions";
import { getCurrentAccount } from "@/lib/server/session";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallets", label: "Wallets" },
  { href: "/reports", label: "Reports" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

async function handleLogout() {
  "use server";
  await logoutUser();
  redirect("/login");
}

export default async function AppHeader() {
  const account = await getCurrentAccount();
  const displayName = account?.name?.trim() || account?.email || null;
  const initials = (displayName ?? "?")
    .split(" ")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "?";

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Shell className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Shared Wallet
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        {account ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {initials}
              </span>
              <div className="hidden text-left text-sm sm:block">
                <p className="font-medium text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{account.email}</p>
              </div>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 px-3 text-sm text-slate-700 hover:text-slate-900"
                  )}
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "px-3 py-2 text-sm")}>Log in</Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "px-3 py-2 text-sm")}>Sign up</Link>
          </div>
        )}
      </Shell>
    </header>
  );
}

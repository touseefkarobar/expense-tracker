import Link from "next/link";
import { Shell } from "@/components/layout/shell";

export default function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Shell className="flex flex-col gap-4 py-10 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Shared Wallet Expense Tracker.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="https://appwrite.io" target="_blank" rel="noreferrer">
            Powered by Appwrite
          </Link>
        </div>
      </Shell>
    </footer>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeatureGrid from "@/components/dashboard/feature-grid";
import { Shell } from "@/components/layout/shell";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";

export default function HomePage() {
  return (
    <Shell>
      <section className="flex flex-col gap-8 py-16">
        <div className="grid gap-6 text-center md:text-left">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand">
            Shared Wallet Expense Tracker
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Keep every wallet, transaction, and budget aligned.
          </h1>
          <p className="text-lg text-slate-600">
            Collaborate on real-time finances with Appwrite-backed auth, role-aware permissions, and insights that make
            every decision clearer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "justify-center")}> 
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "justify-center")}
            >
              View demo dashboard
            </Link>
          </div>
        </div>
        <FeatureGrid />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Usage guide snapshot</h2>
          <p className="mt-2 text-sm text-slate-600">
            Deploying your own workspace takes just a few steps. Once signed in you can create wallets, categories, and
            transactions without leaving the dashboard.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Copy `.env.example` to `.env.local`, then run <code>npm run setup:appwrite</code> to provision the schema.</li>
            <li>Start the dev server with <code>npm run dev</code> and create an account from the login page.</li>
            <li>
              Visit the dashboard to add a wallet, define income/expense categories, and record your first shared
              transaction.
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "justify-center")}>
              Open dashboard
            </Link>
            <Link href="/usage" className={cn(buttonVariants({ variant: "ghost" }), "justify-center")}>
              View full usage guide
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}

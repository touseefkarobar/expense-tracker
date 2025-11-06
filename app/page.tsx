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
      </section>
    </Shell>
  );
}

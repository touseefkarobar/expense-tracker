import type { Metadata } from "next";
import { Shell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "Terms of service | Shared Wallet Expense Tracker"
};

export default function TermsPage() {
  return (
    <Shell className="space-y-6 py-16 text-sm text-slate-600">
      <h1 className="text-3xl font-semibold text-slate-900">Terms of service</h1>
      <p>
        Replace this placeholder with your organization&apos;s official terms. Outline how shared wallets operate, the
        responsibilities of members, and the guarantees provided for data residency and retention using Appwrite.
      </p>
      <p>
        Ensure that your legal copy references the Appwrite platform services you rely on, including Authentication,
        Databases, Storage, and Functions.
      </p>
    </Shell>
  );
}

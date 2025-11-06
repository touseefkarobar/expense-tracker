import type { Metadata } from "next";
import { Shell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "Privacy policy | Shared Wallet Expense Tracker"
};

export default function PrivacyPage() {
  return (
    <Shell className="space-y-6 py-16 text-sm text-slate-600">
      <h1 className="text-3xl font-semibold text-slate-900">Privacy policy</h1>
      <p>
        This starter project is wired for Appwrite authentication, databases, storage, and functions. Update this
        policy once you connect to production services and begin processing personal data.
      </p>
      <p>
        In development mode, no information leaves your machine. When deployed, ensure Appwrite rules align with your
        regional compliance requirements.
      </p>
    </Shell>
  );
}

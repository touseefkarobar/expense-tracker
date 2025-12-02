import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Shared Wallet Expense Tracker"
};

interface DashboardPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default function DashboardIndex({ searchParams }: DashboardPageProps) {
  const params = new URLSearchParams();
  if (searchParams.wallet) params.set("wallet", searchParams.wallet);
  if (searchParams.month) params.set("month", searchParams.month);
  const query = params.toString();
  redirect(`/dashboard/overview${query ? `?${query}` : ""}`);
}

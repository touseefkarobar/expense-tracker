import type { Metadata } from "next";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wallets | Shared Wallet Expense Tracker"
};

export default function WalletsPage() {
  return (
    <Shell className="space-y-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Shared wallets</h1>
        <p className="text-sm text-slate-600">
          Manage collaboration by connecting this UI to Appwrite Teams and membership invites.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Coming soon</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Create wallets, invite collaborators, and manage roles. Use Appwrite Teams APIs from server actions to
            enforce access control per wallet.
          </p>
          <p>
            This placeholder demonstrates the route-based organization and leaves room for connecting to live data.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}

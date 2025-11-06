import type { Metadata } from "next";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reports | Shared Wallet Expense Tracker"
};

export default function ReportsPage() {
  return (
    <Shell className="space-y-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Insights & exports</h1>
        <p className="text-sm text-slate-600">
          Schedule CSV exports, render charts, and share monthly updates with your shared wallet members.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Reporting roadmap</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Integrate Appwrite Functions to pre-aggregate category spend, then fetch those summaries via server
            components. Use the Recharts components shown on the dashboard to visualize additional time ranges.
          </p>
          <p>
            Attach CSV exports using Appwrite Storage and serve them with signed URLs scoped to each wallet.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}

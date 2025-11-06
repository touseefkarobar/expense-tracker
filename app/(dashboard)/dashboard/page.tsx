import { Metadata } from "next";
import { Shell } from "@/components/layout/shell";
import OverviewChart from "@/components/dashboard/overview-chart";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard | Shared Wallet Expense Tracker"
};

const mockTrend = [
  { month: "Jan", income: 7200, expenses: 4800 },
  { month: "Feb", income: 6800, expenses: 5200 },
  { month: "Mar", income: 7000, expenses: 5100 },
  { month: "Apr", income: 7300, expenses: 5500 },
  { month: "May", income: 7500, expenses: 5600 },
  { month: "Jun", income: 7400, expenses: 5300 }
];

const mockBudgets = [
  { label: "Household essentials", spent: 820, limit: 1200 },
  { label: "Eating out", spent: 460, limit: 500 },
  { label: "Transport", spent: 310, limit: 450 }
];

const mockActivity = [
  {
    id: "1",
    actor: "Quinn D.",
    action: "added an expense • Groceries • $82.10",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    actor: "Sky P.",
    action: "approved budget alert • Eating out hit 90%",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: "3",
    actor: "Mina R.",
    action: "uploaded receipt • Ride share • $18.20",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  }
];

export default function DashboardPage() {
  return (
    <Shell className="space-y-10 py-12">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">June overview</h1>
        <p className="text-sm text-slate-600">
          Powered by Appwrite Documents, Functions, and Teams to keep every wallet in sync.
        </p>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Income vs. Expense</h2>
            <p className="text-sm text-slate-600">
              Real-time financial health aggregated by an Appwrite scheduled analytics function.
            </p>
          </CardHeader>
          <CardContent>
            <OverviewChart data={mockTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Budget health</h2>
            <p className="text-sm text-slate-600">Tracked with Appwrite document permissions per wallet.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockBudgets.map(budget => (
              <BudgetProgress key={budget.label} {...budget} />
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-600">Appwrite audit logs surface who did what and when.</p>
          </CardHeader>
          <CardContent>
            <RecentActivity items={mockActivity} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Next steps</h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              Connect the Appwrite SDK to live data by updating the environment variables and provisioning the
              collections described in the README. Use Teams for wallet memberships and Document permissions for
              role-based access control.
            </p>
            <p>
              Add scheduled functions for recurring transactions and budget notifications. Update these placeholder
              cards with data fetched via server components or React Query.
            </p>
          </CardContent>
        </Card>
      </section>
    </Shell>
  );
}

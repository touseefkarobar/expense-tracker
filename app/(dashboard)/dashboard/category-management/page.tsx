import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardFrame } from "../_components/dashboard-frame";
import { loadDashboardData } from "../_components/dashboard-data";
import { CreateCategoryForm } from "../_components/create-category-form";
import { getCategoryIcon } from "../_components/category-metadata";

export const revalidate = 0;

interface CategoryManagementPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function CategoryManagementPage({ searchParams }: CategoryManagementPageProps) {
  const { snapshot, loadError, activeWallet, currency, selectedMonth, selectedMonthLabel } =
    await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="category-management"
      snapshot={snapshot}
      activeWallet={activeWallet}
      currency={currency}
      loadError={loadError}
      selectedMonth={selectedMonth}
      selectedMonthLabel={selectedMonthLabel}
    >
      {!hasWallets ? (
        <Card className="border-dashed border-slate-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">No wallets yet</h2>
            <p className="text-sm text-slate-600">Create a wallet first to manage categories.</p>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Category Management</p>
            <h2 className="text-2xl font-semibold text-slate-900">Shape how you organise spending</h2>
            <p className="text-sm text-slate-600">
              Standardise buckets across the team so reporting and budgets stay clean.
            </p>
            <p className="text-xs text-slate-500">Transactions shown below reflect {selectedMonthLabel}.</p>
          </div>
          <Card>
            <CardContent className="space-y-5 pt-6">
              <CreateCategoryForm walletId={snapshot.activeWalletId!} />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Existing categories</h3>
                {snapshot.categories.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                    No categories yet. Create one to get started.
                  </p>
                ) : (
                  <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    {snapshot.categories.map(category => {
                      const Icon = getCategoryIcon(category.icon);
                      return (
                        <li
                          key={category.$id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60"
                              style={{ backgroundColor: category.color ?? "rgba(148, 163, 184, 0.15)" }}
                            >
                              <Icon className="h-4 w-4 text-slate-700" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{category.name}</span>
                              <span className="text-xs uppercase tracking-wide text-slate-400">{category.type}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </DashboardFrame>
  );
}

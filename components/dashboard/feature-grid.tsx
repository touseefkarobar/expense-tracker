import type { LucideIcon } from "lucide-react";
import { Wallet, Users, BarChart3, ShieldCheck, Zap, CalendarClock } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features = [
  {
    title: "Shared wallets",
    description: "Create multiple wallets, invite teammates, and control their permissions with Appwrite Teams.",
    icon: Wallet
  },
  {
    title: "Role-aware security",
    description: "Document-level rules keep transactions safe while enabling collaboration.",
    icon: ShieldCheck
  },
  {
    title: "Fast transaction capture",
    description: "Keyboard-friendly forms, recurring rules, and receipt uploads make input painless.",
    icon: Zap
  },
  {
    title: "Advanced insights",
    description: "Budgets, burn-down charts, and exportable reports for every wallet.",
    icon: BarChart3
  },
  {
    title: "Member visibility",
    description: "See who added what with a real-time activity log across your workspace.",
    icon: Users
  },
  {
    title: "Automations",
    description: "Scheduled functions generate recurring entries and notify budget thresholds.",
    icon: CalendarClock
  }
] satisfies readonly Feature[];

export default function FeatureGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map(({ title, description, icon: Icon }) => (
        <article
          key={title}
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <Icon aria-hidden="true" className="mb-4 h-10 w-10 text-brand" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </article>
      ))}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Gift,
  GraduationCap,
  HeartPulse,
  Music4,
  PiggyBank,
  Plane,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  Wallet
} from "lucide-react";

export const CATEGORY_COLOR_SWATCHES = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#14b8a6",
  "#facc15",
  "#a855f7",
  "#f43f5e",
  "#0ea5e9",
  "#ef4444",
  "#6366f1"
];

export interface CategoryIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: "shopping-bag", label: "Shopping", icon: ShoppingBag },
  { value: "utensils", label: "Dining", icon: UtensilsCrossed },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "savings", label: "Savings", icon: PiggyBank },
  { value: "wallet", label: "Wallet", icon: Wallet },
  { value: "health", label: "Health", icon: HeartPulse },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "entertainment", label: "Entertainment", icon: Music4 },
  { value: "gifts", label: "Gifts", icon: Gift }
];

export const CATEGORY_ICON_MAP = CATEGORY_ICON_OPTIONS.reduce<Record<string, LucideIcon>>((acc, option) => {
  acc[option.value] = option.icon;
  return acc;
}, {});

export function getCategoryIcon(key?: string | null): LucideIcon {
  if (!key) {
    return Tag;
  }

  return CATEGORY_ICON_MAP[key] ?? Tag;
}

import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Briefcase,
  Bus,
  Car,
  Coins,
  Dog,
  Dumbbell,
  Fuel,
  Gift,
  GraduationCap,
  Hammer,
  HeartPulse,
  Home,
  Music4,
  Palette,
  PiggyBank,
  Plane,
  ShoppingCart,
  ShoppingBag,
  Sprout,
  Tag,
  TrainFront,
  Trees,
  Tv,
  UtensilsCrossed,
  Wallet,
  Wine
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
  { value: "gifts", label: "Gifts", icon: Gift },
  { value: "home", label: "Home", icon: Home },
  { value: "transport", label: "Transport", icon: Bus },
  { value: "car", label: "Car", icon: Car },
  { value: "fuel", label: "Fuel", icon: Fuel },
  { value: "pets", label: "Pets", icon: Dog },
  { value: "baby", label: "Baby", icon: Baby },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
  { value: "repairs", label: "Repairs", icon: Hammer },
  { value: "groceries", label: "Groceries", icon: ShoppingCart },
  { value: "nature", label: "Outdoors", icon: Trees },
  { value: "investing", label: "Investing", icon: Coins },
  { value: "growing", label: "Garden", icon: Sprout },
  { value: "art", label: "Creativity", icon: Palette },
  { value: "media", label: "Media", icon: Tv },
  { value: "train", label: "Train", icon: TrainFront },
  { value: "wine", label: "Wine", icon: Wine }
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

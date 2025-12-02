"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface MonthSelectorProps {
  selectedMonth: string;
  basePath: string;
  searchParams: { wallet?: string; month?: string };
}

const buildMonthOptions = (count: number) => {
  const now = new Date();
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    const value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return { value, label };
  });
};

export function MonthSelector({ selectedMonth, basePath, searchParams }: MonthSelectorProps) {
  const router = useRouter();
  const currentParams = useSearchParams();
  const options = useMemo(() => {
    const base = buildMonthOptions(12);
    const exists = base.some(option => option.value === selectedMonth);
    if (!exists) {
      const [year, month] = selectedMonth.split("-").map(part => Number.parseInt(part, 10));
      const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, { month: "long", year: "numeric" });
      return [{ value: selectedMonth, label }, ...base];
    }
    return base;
  }, [selectedMonth]);

  const handleChange = (nextMonth: string) => {
    const params = new URLSearchParams(currentParams.toString());
    if (nextMonth) {
      params.set("month", nextMonth);
    } else {
      params.delete("month");
    }
    if (searchParams.wallet) {
      params.set("wallet", searchParams.wallet);
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-selector" className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Month
      </label>
      <select
        id="month-selector"
        value={selectedMonth}
        onChange={event => handleChange(event.target.value)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

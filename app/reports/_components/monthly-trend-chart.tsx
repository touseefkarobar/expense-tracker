"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface MonthlyTrendPoint {
  monthLabel: string;
  income: number;
  expenses: number;
  net: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
  currency: string;
}

const formatCurrency = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export function MonthlyTrendChart({ data, currency }: MonthlyTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="monthLabel" tickLine={false} stroke="#64748b" fontSize={12} />
        <YAxis
          tickLine={false}
          stroke="#64748b"
          fontSize={12}
          tickFormatter={value => formatCurrency(currency, Number(value))}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(currency, value)}
          contentStyle={{ borderRadius: "0.75rem", borderColor: "#cbd5f5" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#059669"
          fill="#d1fae5"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#dc2626"
          fill="#fee2e2"
          strokeWidth={2}
        />
        <Line type="monotone" dataKey="net" name="Net" stroke="#0f172a" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

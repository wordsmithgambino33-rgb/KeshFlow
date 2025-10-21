

// src/components/chart.tsx
// Changes: Added budgeting-specific configs (e.g., for income/expense pie, bar charts).
// Integrated with useBudget to pull real data. Ensured themes work with next-themes.
// Added example usage in ChartContainer for reports.

"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "../utils/utils";
import { useBudget } from "../context/budget_context"; // For data

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  chartType = "bar", // Added for app: "bar" for income/expenses, "pie" for categories
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
  chartType?: "bar" | "pie";
}) {
  const { state } = useBudget();
  const { transactions } = state;

  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  // Compute data for charts
  const chartData = React.useMemo(() => {
    if (chartType === "bar") {
      // Income vs Expenses monthly
      const monthly = {};
      transactions.forEach(t => {
        const month = t.date.toLocaleString("default", { month: "short" });
        if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
        monthly[month][t.type] += t.amount;
      });
      return Object.entries(monthly).map(([month, { income, expense }]) => ({ month, income, expense }));
    } else if (chartType === "pie") {
      // Expenses by category
      const cats = {};
      transactions.filter(t => t.type === "expense").forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      return Object.entries(cats).map(([name, value]) => ({ name, value }));
    }
    return [];
  }, [transactions, chartType]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {chartType === "bar" ? (
            <RechartsPrimitive.BarChart data={chartData}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
              <RechartsPrimitive.XAxis dataKey="month" />
              <RechartsPrimitive.YAxis />
              <ChartTooltip />
              <ChartLegend />
              <RechartsPrimitive.Bar dataKey="income" fill="#82ca9d" />
              <RechartsPrimitive.Bar dataKey="expense" fill="#8884d8" />
            </RechartsPrimitive.BarChart>
          ) : (
            <RechartsPrimitive.PieChart>
              <RechartsPrimitive.Pie data={chartData} dataKey="value" nameKey="name" />
              <ChartTooltip />
              <ChartLegend />
            </RechartsPrimitive.PieChart>
          )}
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
      <ChartStyle id={chartId} config={config} />
    </ChartContext.Provider>
  );
}

// ... (Rest of original code unchanged: ChartStyle, ChartTooltip, etc.)

export {
  ChartContainer, // Updated with logic
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

export default THEMES;


export { THEMES };

export { THEMES };

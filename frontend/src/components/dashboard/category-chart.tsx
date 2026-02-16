"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatNumber } from "@/lib/utils";
import type { CategoryBreakdown } from "@/lib/mock-data";

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

const chartConfig: ChartConfig = {
  "Transaction Volume": {
    label: "Transaction Volume",
    color: "hsl(var(--chart-1))",
  },
};

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((d) => ({
    category: d.category,
    "Transaction Volume": d.volume,
    "Amount (USD)": d.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions by Category</CardTitle>
        <CardDescription>Volume and amount breakdown across payment categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              width={80}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatNumber(v)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="Transaction Volume"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

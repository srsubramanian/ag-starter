"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "@tremor/react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { CategoryBreakdown } from "@/lib/mock-data";

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

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
        <BarChart
          className="h-80"
          data={chartData}
          index="category"
          categories={["Transaction Volume"]}
          colors={["blue"]}
          yAxisWidth={80}
          showAnimation={true}
          valueFormatter={(v: number) => formatNumber(v)}
        />
      </CardContent>
    </Card>
  );
}

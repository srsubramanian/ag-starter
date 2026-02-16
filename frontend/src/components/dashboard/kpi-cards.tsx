"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeltaBadge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area } from "recharts";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { KpiData, DailyVolume } from "@/lib/mock-data";

interface KpiCardsProps {
  kpi: KpiData;
  dailyVolumes: DailyVolume[];
}

const volumeConfig: ChartConfig = {
  Transactions: { label: "Transactions", color: "hsl(var(--chart-1))" },
};

const successConfig: ChartConfig = {
  "Success Rate": { label: "Success Rate", color: "hsl(var(--chart-2))" },
};

const latencyConfig: ChartConfig = {
  "Latency (ms)": { label: "Latency (ms)", color: "hsl(var(--chart-3))" },
};

export function KpiCards({ kpi, dailyVolumes }: KpiCardsProps) {
  const volumeChartData = dailyVolumes.map((d) => ({
    date: d.date.slice(5), // MM-DD
    Transactions: d.transactions,
  }));

  const successChartData = dailyVolumes.map((d) => ({
    date: d.date.slice(5),
    "Success Rate": d.successRate,
  }));

  const latencyChartData = dailyVolumes.map((d) => ({
    date: d.date.slice(5),
    "Latency (ms)": Math.round(140 + Math.random() * 100),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Transaction Volume */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transaction Volume
          </CardTitle>
          <DeltaBadge
            value={`${kpi.transactionVolume.trend > 0 ? "+" : ""}${kpi.transactionVolume.trend.toFixed(1)}%`}
            trend={kpi.transactionVolume.trend > 0 ? "up" : "down"}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(kpi.transactionVolume.current)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatNumber(kpi.transactionVolume.previous)} last period
          </p>
          <ChartContainer config={volumeConfig} className="mt-4 h-20 w-full aspect-auto">
            <AreaChart data={volumeChartData}>
              <defs>
                <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="Transactions"
                stroke="hsl(var(--chart-1))"
                fill="url(#fillVolume)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Success Rate
          </CardTitle>
          <DeltaBadge
            value={`${kpi.successRate.trend > 0 ? "+" : ""}${kpi.successRate.trend.toFixed(2)}%`}
            trend={kpi.successRate.trend > 0 ? "up" : "down"}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(kpi.successRate.current)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatPercent(kpi.successRate.previous)} last period
          </p>
          <ChartContainer config={successConfig} className="mt-4 h-20 w-full aspect-auto">
            <AreaChart data={successChartData}>
              <defs>
                <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="Success Rate"
                stroke="hsl(var(--chart-2))"
                fill="url(#fillSuccess)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Average Latency */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Latency
          </CardTitle>
          <DeltaBadge
            value={`${kpi.avgLatency.trend > 0 ? "+" : ""}${kpi.avgLatency.trend.toFixed(1)}%`}
            trend={kpi.avgLatency.trend < 0 ? "down" : "up"}
            isPositive={kpi.avgLatency.trend < 0}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpi.avgLatency.current}ms</div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {kpi.avgLatency.previous}ms last period
          </p>
          <ChartContainer config={latencyConfig} className="mt-4 h-20 w-full aspect-auto">
            <AreaChart data={latencyChartData}>
              <defs>
                <linearGradient id="fillLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="Latency (ms)"
                stroke="hsl(var(--chart-3))"
                fill="url(#fillLatency)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

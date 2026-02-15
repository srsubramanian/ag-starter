"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BadgeDelta } from "@tremor/react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { KpiData, DailyVolume } from "@/lib/mock-data";

interface KpiCardsProps {
  kpi: KpiData;
  dailyVolumes: DailyVolume[];
}

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
          <BadgeDelta
            deltaType={kpi.transactionVolume.trend > 0 ? "increase" : "decrease"}
            size="sm"
          >
            {kpi.transactionVolume.trend > 0 ? "+" : ""}
            {kpi.transactionVolume.trend.toFixed(1)}%
          </BadgeDelta>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(kpi.transactionVolume.current)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatNumber(kpi.transactionVolume.previous)} last period
          </p>
          <AreaChart
            className="mt-4 h-20"
            data={volumeChartData}
            index="date"
            categories={["Transactions"]}
            colors={["blue"]}
            showXAxis={false}
            showYAxis={false}
            showLegend={false}
            showGridLines={false}
            showTooltip={true}
            curveType="monotone"
          />
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Success Rate
          </CardTitle>
          <BadgeDelta
            deltaType={kpi.successRate.trend > 0 ? "increase" : "decrease"}
            size="sm"
          >
            {kpi.successRate.trend > 0 ? "+" : ""}
            {kpi.successRate.trend.toFixed(2)}%
          </BadgeDelta>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(kpi.successRate.current)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatPercent(kpi.successRate.previous)} last period
          </p>
          <AreaChart
            className="mt-4 h-20"
            data={successChartData}
            index="date"
            categories={["Success Rate"]}
            colors={["emerald"]}
            showXAxis={false}
            showYAxis={false}
            showLegend={false}
            showGridLines={false}
            showTooltip={true}
            curveType="monotone"
          />
        </CardContent>
      </Card>

      {/* Average Latency */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Latency
          </CardTitle>
          <BadgeDelta
            deltaType={kpi.avgLatency.trend < 0 ? "decrease" : "increase"}
            size="sm"
            isIncreasePositive={false}
          >
            {kpi.avgLatency.trend > 0 ? "+" : ""}
            {kpi.avgLatency.trend.toFixed(1)}%
          </BadgeDelta>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpi.avgLatency.current}ms</div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {kpi.avgLatency.previous}ms last period
          </p>
          <AreaChart
            className="mt-4 h-20"
            data={latencyChartData}
            index="date"
            categories={["Latency (ms)"]}
            colors={["amber"]}
            showXAxis={false}
            showYAxis={false}
            showLegend={false}
            showGridLines={false}
            showTooltip={true}
            curveType="monotone"
          />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeltaBadge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface TransactionSummaryData {
  tenant_id: string;
  date_range: string;
  total_transactions: number;
  total_amount_usd: number;
  success_rate_pct: number;
  avg_latency_ms: number;
  daily_breakdown: { date: string; volume: number; amount_usd: number }[];
  top_merchants: { name: string; volume: number; amount_usd: number }[];
}

interface TransactionSummaryRenderProps {
  status: "inProgress" | "executing" | "complete";
  result: TransactionSummaryData | undefined;
}

const chartConfig: ChartConfig = {
  Volume: { label: "Volume", color: "hsl(var(--chart-1))" },
};

function Skeleton() {
  return (
    <Card className="w-full animate-pulse">
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
        <div className="h-40 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export function TransactionSummaryRender({
  status,
  result,
}: TransactionSummaryRenderProps) {
  if (status !== "complete" || !result) return <Skeleton />;

  const chartData = result.daily_breakdown.map((d) => ({
    date: d.date.slice(5),
    Volume: d.volume,
    "Amount (USD)": d.amount_usd,
  }));

  const maxMerchantVolume = Math.max(
    ...result.top_merchants.map((m) => m.volume)
  );

  const successDelta =
    result.success_rate_pct >= 99
      ? "up"
      : result.success_rate_pct >= 98
        ? "up"
        : "down";

  return (
    <div className="space-y-4 w-full">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-xl font-bold">
              {formatNumber(result.total_transactions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold">
              {formatCurrency(result.total_amount_usd)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">
                {formatPercent(result.success_rate_pct)}
              </p>
              <DeltaBadge
                value={`${result.success_rate_pct >= 99 ? "OK" : result.success_rate_pct >= 98 ? "~" : "Low"}`}
                trend={successDelta}
                isPositive={result.success_rate_pct >= 98}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Avg Latency</p>
            <p className="text-xl font-bold">{result.avg_latency_ms}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Volume Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Daily Transaction Volume ({result.date_range})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillTxVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="Volume"
                stroke="hsl(var(--chart-1))"
                fill="url(#fillTxVolume)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Merchants */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Top Merchants by Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.top_merchants.map((m) => (
            <div key={m.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatNumber(m.volume)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-[hsl(var(--chart-1))]"
                  style={{
                    width: `${(m.volume / maxMerchantVolume) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

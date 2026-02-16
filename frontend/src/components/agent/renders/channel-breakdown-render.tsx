"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface ChannelData {
  channel: string;
  volume_pct: number;
  avg_ticket_usd: number;
  success_rate_pct: number;
}

interface ChannelBreakdownData {
  tenant_id: string;
  channels: ChannelData[];
  total_channels_active: number;
  fastest_channel: string;
  highest_value_channel: string;
}

interface ChannelBreakdownRenderProps {
  status: "inProgress" | "executing" | "complete";
  result: ChannelBreakdownData | undefined;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(190 80% 50%)",
  "hsl(var(--chart-4))",
  "hsl(260 60% 55%)",
  "hsl(var(--chart-5))",
];

function Skeleton() {
  return (
    <Card className="w-full animate-pulse">
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-6 w-32 bg-muted rounded-full" />
          <div className="h-6 w-32 bg-muted rounded-full" />
        </div>
        <div className="h-48 bg-muted rounded-full w-48 mx-auto" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChannelBreakdownRender({
  status,
  result,
}: ChannelBreakdownRenderProps) {
  if (status !== "complete" || !result) return <Skeleton />;

  const donutData = result.channels.map((c) => ({
    name: c.channel,
    value: c.volume_pct,
  }));

  const chartConfig: ChartConfig = Object.fromEntries(
    result.channels.map((c, i) => [
      c.channel,
      { label: c.channel, color: COLORS[i % COLORS.length] },
    ])
  );

  return (
    <div className="space-y-4 w-full">
      {/* Info Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="blue">Fastest: {result.fastest_channel}</Badge>
        <Badge variant="emerald">
          Highest Value: {result.highest_value_channel}
        </Badge>
        <Badge variant="gray">
          {result.total_channels_active} Channels Active
        </Badge>
      </div>

      {/* Donut Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Volume Distribution by Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full mx-auto">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                  />
                }
              />
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {donutData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {donutData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground">
                  {entry.name} ({entry.value.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Channel Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.channels.map((ch) => (
              <div
                key={ch.channel}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
              >
                <span className="font-medium">{ch.channel}</span>
                <div className="flex gap-4 text-muted-foreground text-xs">
                  <span>Avg: {formatCurrency(ch.avg_ticket_usd)}</span>
                  <span>Success: {formatPercent(ch.success_rate_pct)}</span>
                  <span>{ch.volume_pct}% vol</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

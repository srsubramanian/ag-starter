"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, Badge } from "@tremor/react";
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

  return (
    <div className="space-y-4 w-full">
      {/* Info Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge color="blue" size="sm">
          Fastest: {result.fastest_channel}
        </Badge>
        <Badge color="emerald" size="sm">
          Highest Value: {result.highest_value_channel}
        </Badge>
        <Badge color="gray" size="sm">
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
          <DonutChart
            className="h-48"
            data={donutData}
            category="value"
            index="name"
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
            valueFormatter={(v) => `${v.toFixed(1)}%`}
          />
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

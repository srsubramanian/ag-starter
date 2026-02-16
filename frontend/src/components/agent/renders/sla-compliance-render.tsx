"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils";

interface SlaComplianceData {
  tenant_id: string;
  period: string;
  uptime_pct: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  error_rate_pct: number;
  sla_targets: {
    uptime_target_pct: number;
    p95_latency_target_ms: number;
    error_rate_target_pct: number;
  };
  compliance_status: {
    uptime: string;
    latency: string;
    error_rate: string;
  };
  incidents_this_month: number;
}

interface SlaComplianceRenderProps {
  status: "inProgress" | "executing" | "complete";
  result: SlaComplianceData | undefined;
}

function statusVariant(s: string): "emerald" | "amber" | "red" {
  if (s === "COMPLIANT") return "emerald";
  if (s === "AT_RISK") return "amber";
  return "red";
}

function Skeleton() {
  return (
    <Card className="w-full animate-pulse">
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-24 bg-muted rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
        <div className="h-10 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export function SlaComplianceRender({
  status,
  result,
}: SlaComplianceRenderProps) {
  if (status !== "complete" || !result) return <Skeleton />;

  const { compliance_status, sla_targets } = result;

  // Segmented bar: show P50, P95-P50, P99-P95 as segments
  const p50 = result.p50_latency_ms;
  const p95 = result.p95_latency_ms;
  const p99 = result.p99_latency_ms;
  const total = p99;
  const segments = [
    { pct: Math.round((p50 / total) * 100), color: "bg-emerald-500" },
    { pct: Math.round(((p95 - p50) / total) * 100), color: "bg-amber-500" },
    { pct: Math.round(((p99 - p95) / total) * 100), color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Compliance Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={statusVariant(compliance_status.uptime)}>
          Uptime: {compliance_status.uptime}
        </Badge>
        <Badge variant={statusVariant(compliance_status.latency)}>
          Latency: {compliance_status.latency}
        </Badge>
        <Badge variant={statusVariant(compliance_status.error_rate)}>
          Error Rate: {compliance_status.error_rate}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-xl font-bold">{result.uptime_pct}%</p>
            <p className="text-xs text-muted-foreground">
              Target: {sla_targets.uptime_target_pct}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">P95 Latency</p>
            <p className="text-xl font-bold">{result.p95_latency_ms}ms</p>
            <p className="text-xs text-muted-foreground">
              Target: {sla_targets.p95_latency_target_ms}ms
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Error Rate</p>
            <p className="text-xl font-bold">
              {formatPercent(result.error_rate_pct)}
            </p>
            <p className="text-xs text-muted-foreground">
              Target: {formatPercent(sla_targets.error_rate_target_pct)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Incidents</p>
            <p className="text-xl font-bold">{result.incidents_this_month}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Latency Percentiles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Latency Percentiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex h-4 w-full overflow-hidden rounded-full mt-2">
            {segments.map((seg, i) => (
              <div
                key={i}
                className={`${seg.color} h-full`}
                style={{ width: `${seg.pct}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>P50: {p50}ms</span>
            <span>P95: {p95}ms</span>
            <span>P99: {p99}ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

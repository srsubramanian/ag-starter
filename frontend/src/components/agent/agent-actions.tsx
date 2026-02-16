"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { getTenantInfo } from "@/lib/mock-data";
import { useToolResults } from "@/contexts/tool-results-context";
import { BarChart3, Shield, Zap, Loader2, CheckCircle2 } from "lucide-react";

const toolMeta: Record<string, { label: string; icon: typeof BarChart3; color: string }> = {
  get_transaction_summary: { label: "Transaction Summary", icon: BarChart3, color: "text-blue-500" },
  get_sla_compliance: { label: "SLA Compliance", icon: Shield, color: "text-emerald-500" },
  get_payment_channel_breakdown: { label: "Channel Breakdown", icon: Zap, color: "text-amber-500" },
};

function InlineToolCard({ toolName, status }: { toolName: string; status: string }) {
  const meta = toolMeta[toolName];
  const { selectResult } = useToolResults();
  if (!meta) return null;
  const Icon = meta.icon;
  const isComplete = status === "complete";

  return (
    <button
      type="button"
      onClick={() => selectResult(toolName)}
      className="flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 my-1 text-left hover:bg-accent transition-colors cursor-pointer"
    >
      <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
      <span className="text-sm font-medium flex-1">{meta.label}</span>
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
      )}
    </button>
  );
}

/**
 * Registers CopilotKit declarative render actions and readable context.
 *
 * Each useCopilotAction uses available: "disabled" to act as render-only —
 * the backend handles tool execution, the frontend only renders the result
 * inline in the chat when it sees a matching TOOL_CALL event.
 *
 * Chat shows a compact card; the full visualization appears in the right panel.
 */
export function AgentActions() {
  const tenantInfo = getTenantInfo();
  const { pushResult } = useToolResults();

  useCopilotReadable({
    description: "Current tenant information and dashboard context",
    value: {
      tenant: tenantInfo,
      dateRange: "Last 30 days",
      dashboardView: "overview",
    },
  });

  useCopilotAction({
    name: "get_transaction_summary",
    description: "Display transaction summary with charts",
    parameters: [
      { name: "tenant_id", type: "string" },
      { name: "date_range", type: "string" },
    ],
    available: "disabled",
    render: ({ status, result }) => {
      pushResult("get_transaction_summary", status, result);
      return <InlineToolCard toolName="get_transaction_summary" status={status} />;
    },
  });

  useCopilotAction({
    name: "get_sla_compliance",
    description: "Display SLA compliance metrics",
    parameters: [
      { name: "tenant_id", type: "string" },
    ],
    available: "disabled",
    render: ({ status, result }) => {
      pushResult("get_sla_compliance", status, result);
      return <InlineToolCard toolName="get_sla_compliance" status={status} />;
    },
  });

  useCopilotAction({
    name: "get_payment_channel_breakdown",
    description: "Display payment channel breakdown",
    parameters: [
      { name: "tenant_id", type: "string" },
    ],
    available: "disabled",
    render: ({ status, result }) => {
      pushResult("get_payment_channel_breakdown", status, result);
      return <InlineToolCard toolName="get_payment_channel_breakdown" status={status} />;
    },
  });

  return null;
}

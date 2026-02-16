"use client";

import { useToolResults } from "@/contexts/tool-results-context";
import { TransactionSummaryRender } from "./renders/transaction-summary-render";
import { SlaComplianceRender } from "./renders/sla-compliance-render";
import { ChannelBreakdownRender } from "./renders/channel-breakdown-render";
import { Bot, BarChart3, Shield, Zap } from "lucide-react";

const promptSuggestions = [
  {
    icon: BarChart3,
    color: "text-blue-500",
    text: "Show me transaction volume for the last 7 days",
  },
  {
    icon: Shield,
    color: "text-emerald-500",
    text: "Are we meeting our SLA targets this month?",
  },
  {
    icon: Zap,
    color: "text-amber-500",
    text: "What's the breakdown of payment channels?",
  },
  {
    icon: Bot,
    color: "text-purple-500",
    text: "Give me a full FinOps summary for my tenant",
  },
];

function WelcomeState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Bot className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">FinOps Agent</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Ask the assistant about transaction volumes, SLA compliance, or payment
        channel breakdowns. Results will appear here.
      </p>
      <div className="grid gap-3 w-full max-w-lg">
        {promptSuggestions.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.text}
              className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              <Icon className={`h-4 w-4 shrink-0 ${s.color}`} />
              <span>&ldquo;{s.text}&rdquo;</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const renderMap: Record<string, React.FC<{ status: string; result: unknown }>> = {
  get_transaction_summary: TransactionSummaryRender as React.FC<{ status: string; result: unknown }>,
  get_sla_compliance: SlaComplianceRender as React.FC<{ status: string; result: unknown }>,
  get_payment_channel_breakdown: ChannelBreakdownRender as React.FC<{ status: string; result: unknown }>,
};

export function ResultsPanel() {
  const { activeResult } = useToolResults();

  if (!activeResult) return <WelcomeState />;

  const RenderComponent = renderMap[activeResult.toolName];
  if (!RenderComponent) return <WelcomeState />;

  return (
    <div className="space-y-4">
      <RenderComponent
        status={activeResult.status}
        result={activeResult.result}
      />
    </div>
  );
}

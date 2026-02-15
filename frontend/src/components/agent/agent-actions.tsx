"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { getTenantInfo } from "@/lib/mock-data";

/**
 * Registers CopilotKit actions and readable context.
 *
 * - useCopilotReadable: shares frontend state with the agent so it has context
 * - useCopilotAction: defines actions the agent can trigger on the frontend
 *
 * AG-UI flow for actions:
 *   Agent sends TOOL_CALL_START → frontend executes the action → result sent back
 */
export function AgentActions() {
  const tenantInfo = getTenantInfo();

  // Share dashboard context with the agent via AG-UI readable state
  useCopilotReadable({
    description: "Current tenant information and dashboard context",
    value: {
      tenant: tenantInfo,
      dateRange: "Last 30 days",
      dashboardView: "overview",
    },
  });

  // Register a sample frontend action the agent can invoke
  useCopilotAction({
    name: "getTransactionSummary",
    description: "Display a transaction summary card on the dashboard for the current tenant",
    parameters: [
      {
        name: "dateRange",
        type: "string",
        description: "Date range for the summary (e.g., '7d', '30d')",
        required: false,
      },
    ],
    handler: async ({ dateRange }) => {
      const range = dateRange || "7d";
      // In a real app, this would update the dashboard UI
      return {
        status: "success",
        message: `Transaction summary for ${tenantInfo.tenantId} (${range}) displayed on dashboard`,
        data: {
          tenantId: tenantInfo.tenantId,
          dateRange: range,
          totalTransactions: 1_247_893,
          successRate: 99.12,
          avgLatencyMs: 187,
        },
      };
    },
  });

  return null;
}

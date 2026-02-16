"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { AgentChat } from "@/components/agent/agent-chat";
import { AgentActions } from "@/components/agent/agent-actions";
import { ToolResultsProvider } from "@/contexts/tool-results-context";
import { ResultsPanel } from "@/components/agent/results-panel";

/**
 * Agent Interaction Page
 *
 * Two-column layout:
 * - Left: CopilotChat (embedded, w-[480px])
 * - Right: Results panel (latest visualization or welcome state)
 */
export default function AgentPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="finops_assistant" showDevConsole={false} enableInspector={false}>
      <ToolResultsProvider>
        {/* Register actions and readable context */}
        <AgentActions />

        <div className="flex h-full">
          {/* Left column: Chat */}
          <div className="w-[480px] shrink-0 border-r overflow-hidden">
            <AgentChat />
          </div>

          {/* Right column: Results */}
          <div className="flex-1 overflow-y-auto p-6">
            <ResultsPanel />
          </div>
        </div>
      </ToolResultsProvider>
    </CopilotKit>
  );
}

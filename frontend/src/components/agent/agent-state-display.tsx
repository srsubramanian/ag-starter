"use client";

import { useCoAgentStateRender } from "@copilotkit/react-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Renders agent state inline as the agent processes requests.
 *
 * useCoAgentStateRender subscribes to STATE_DELTA events from the AG-UI
 * protocol, allowing the UI to show real-time agent progress.
 */
export function AgentStateDisplay() {
  // Subscribe to state updates from the "finops_assistant" agent
  useCoAgentStateRender({
    name: "finops_assistant",
    render: ({ state }) => {
      if (!state || Object.keys(state).length === 0) return null;

      return (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Agent State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-40 rounded bg-muted p-2">
              {JSON.stringify(state, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
    },
  });

  return null;
}

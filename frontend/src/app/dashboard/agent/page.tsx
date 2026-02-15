"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { AgentChat } from "@/components/agent/agent-chat";
import { AgentActions } from "@/components/agent/agent-actions";
import { AgentStateDisplay } from "@/components/agent/agent-state-display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Zap, Shield, BarChart3 } from "lucide-react";

/**
 * Agent Interaction Page
 *
 * This page wraps the CopilotKit provider and wires up:
 * - CopilotSidebar for chat with the FinOps Assistant
 * - useCopilotAction for frontend actions the agent can trigger
 * - useCopilotReadable to share context with the agent
 * - useCoAgentStateRender to display agent state inline
 *
 * The CopilotKit provider connects to /api/copilotkit (same origin),
 * which proxies to the Python agent backend via AG-UI protocol.
 */
export default function AgentPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="finops_assistant">
      {/* Register actions and readable context */}
      <AgentActions />
      <AgentStateDisplay />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FinOps Agent</h1>
          <p className="text-muted-foreground">
            Chat with the AI assistant to explore your financial operations data
          </p>
        </div>

        {/* Capabilities overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 space-y-0 pb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Query transaction volumes, trends, and top merchants
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 space-y-0 pb-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Check uptime, latency percentiles, and incident history
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 space-y-0 pb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-medium">Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analyze payment method distribution and success rates
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 space-y-0 pb-2">
              <Bot className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm font-medium">AI Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Powered by LangGraph + AG-UI protocol with streaming responses
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Prompt suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Try asking</CardTitle>
            <CardDescription>
              Open the chat sidebar and try these prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                "Show me transaction volume for the last 7 days",
                "Are we meeting our SLA targets this month?",
                "What's the breakdown of payment channels?",
                "Give me a full FinOps summary for my tenant",
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
                >
                  &ldquo;{prompt}&rdquo;
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CopilotKit chat sidebar */}
      <AgentChat />
    </CopilotKit>
  );
}

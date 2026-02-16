"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export function AgentChat() {
  return (
    <CopilotChat
      labels={{
        title: "FinOps Assistant",
        initial: "Hi! I'm your FinOps Assistant. Ask me about transaction volumes, SLA compliance, or payment channel breakdowns.",
      }}
      className="h-full"
    />
  );
}

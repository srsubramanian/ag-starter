/**
 * CopilotKit Runtime — AG-UI Bridge
 *
 * This API route hosts the CopilotKit runtime inside the Next.js app.
 * It acts as the bridge between the React frontend (CopilotKit hooks) and
 * the Python agent backend (LangGraph + AG-UI protocol).
 *
 * Architecture:
 *   Browser (CopilotKit React) → POST /api/copilotkit → CopilotRuntime
 *     → HttpAgent (AG-UI) → POST /agui ← Python Agent Backend (FastAPI SSE)
 *
 * The Python backend serves a standard AG-UI SSE endpoint at /agui.
 * The CopilotKit runtime's HttpAgent (via LangGraphHttpAgent) sends
 * RunAgentInput as JSON and receives AG-UI SSE events back.
 *
 * WHY IT LIVES HERE:
 *   - Simplicity: single Next.js deployment, no separate Node service
 *   - Same-origin: no CORS configuration needed for the frontend
 *   - Shared auth context: can access Next.js session/cookies if needed later
 */

import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
} from "@copilotkit/runtime";
import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";

// The Python agent backend URL — set via env var, defaults to local dev
const AGENT_BACKEND_URL =
  process.env.AGENT_BACKEND_URL || "http://localhost:8000";

// Register the FinOps Assistant as a LangGraphHttpAgent (AG-UI HttpAgent).
// This connects to the Python backend's AG-UI SSE endpoint at /agui.
const finopsAgent = new LangGraphHttpAgent({
  url: `${AGENT_BACKEND_URL}/agui`,
});

// Configure the CopilotKit runtime with the agent registered by name.
// The agent name here must match what the React hooks reference via
// <CopilotKit agent="finops_assistant">.
const runtime = new CopilotRuntime({
  agents: {
    finops_assistant: finopsAgent,
  },
});

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

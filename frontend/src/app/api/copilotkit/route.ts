/**
 * CopilotKit Runtime — AG-UI Bridge
 *
 * This API route hosts the CopilotKit runtime inside the Next.js app.
 * It acts as the bridge between the React frontend (CopilotKit hooks) and
 * the Python agent backend (LangGraph + AG-UI protocol).
 *
 * Architecture:
 *   Browser (CopilotKit React) → POST /api/copilotkit → CopilotRuntime
 *     → AG-UI events ← Python Agent Backend (FastAPI + LangGraph)
 *
 * WHY IT LIVES HERE:
 *   - Simplicity: single Next.js deployment, no separate Node service
 *   - Same-origin: no CORS configuration needed for the frontend
 *   - Shared auth context: can access Next.js session/cookies if needed later
 *
 * WHEN TO EXTRACT:
 *   - Multi-frontend: if you have mobile apps or other SPAs consuming the same agent
 *   - Independent scaling: if the runtime needs different compute than the UI
 *   - Network isolation: for compliance (e.g., PCI-DSS) where the agent bridge
 *     must live in a separate network zone from the public-facing UI
 *
 * The CopilotKit runtime handles:
 *   1. Receiving chat messages from the React hooks
 *   2. Forwarding them to the Python agent backend via AG-UI protocol
 *   3. Streaming AG-UI events (text chunks, tool calls, state deltas) back
 *   4. Managing run lifecycle (run_id, thread_id)
 */

import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
} from "@copilotkit/runtime";

// The Python agent backend URL — set via env var, defaults to local dev
const AGENT_BACKEND_URL =
  process.env.AGENT_BACKEND_URL || "http://localhost:8000";

// Configure the CopilotKit runtime to delegate to our Python agent backend.
// The runtime streams AG-UI protocol events between the frontend and the agent.
const runtime = new CopilotRuntime({
  remoteEndpoints: [
    {
      url: `${AGENT_BACKEND_URL}/copilotkit`,
    },
  ],
});

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

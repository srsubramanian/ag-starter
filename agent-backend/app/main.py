"""FastAPI server -- AG-UI endpoint for the FinOps Assistant agent.

This server exposes the LangGraph agent via the CopilotKit Python SDK,
which handles AG-UI protocol event streaming automatically.

AG-UI Event Flow (handled by copilotkit SDK):
  Browser <-> Next.js /api/copilotkit (CopilotKit Runtime)
         <-> This server (FastAPI + copilotkit SDK)
         <-> LangGraph agent <-> AWS Bedrock / Mock LLM
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent

from app.agent import agent_graph
from app.config import settings

app = FastAPI(title="ag-starter Agent Backend", version="0.1.0")

# CORS -- allow the Next.js frontend in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CopilotKit SDK wires the LangGraph agent to AG-UI events ---
sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="finops_assistant",
            description="FinOps Assistant for transaction analytics, SLA compliance, and payment channel insights",
            graph=agent_graph,
        )
    ]
)

# This adds the /copilotkit endpoint that the CopilotKit runtime connects to
add_fastapi_endpoint(app, sdk, "/copilotkit")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "agent": "finops_assistant"}

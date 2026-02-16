"""FastAPI server -- AG-UI protocol endpoint for the FinOps Assistant agent.

This server exposes the LangGraph agent via the AG-UI protocol, streaming
Server-Sent Events (SSE) back to the CopilotKit runtime's HttpAgent.

AG-UI Event Flow:
  Browser <-> Next.js /api/copilotkit (CopilotKit Runtime)
         <-> This server (FastAPI + AG-UI SSE)
         <-> LangGraph agent <-> AWS Bedrock / Mock LLM

AG-UI Protocol Events:
  RUN_STARTED -> TEXT_MESSAGE_START -> TEXT_MESSAGE_CONTENT* -> TEXT_MESSAGE_END
              -> TOOL_CALL_START -> TOOL_CALL_ARGS -> TOOL_CALL_END
              -> STATE_SNAPSHOT -> RUN_FINISHED
"""
from __future__ import annotations

import json
import uuid
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)

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


# ---------------------------------------------------------------------------
# AG-UI message → LangChain message conversion
# ---------------------------------------------------------------------------

def agui_messages_to_langchain(messages: list[dict[str, Any]]) -> list[BaseMessage]:
    """Convert AG-UI RunAgentInput messages to LangChain messages."""
    result: list[BaseMessage] = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        msg_id = msg.get("id", str(uuid.uuid4()))

        # Handle array content (multimodal) -- extract text parts
        if isinstance(content, list):
            text_parts = [
                part["text"] for part in content
                if isinstance(part, dict) and part.get("type") == "text"
            ]
            content = "\n".join(text_parts)

        if role == "user":
            result.append(HumanMessage(content=content, id=msg_id))
        elif role == "assistant":
            # Check for tool calls
            tool_calls = msg.get("toolCalls", [])
            if tool_calls:
                lc_tool_calls = []
                for tc in tool_calls:
                    fn = tc.get("function", {})
                    args_str = fn.get("arguments", "{}")
                    try:
                        args = json.loads(args_str) if isinstance(args_str, str) else args_str
                    except json.JSONDecodeError:
                        args = {}
                    lc_tool_calls.append({
                        "id": tc.get("id", str(uuid.uuid4())),
                        "name": fn.get("name", ""),
                        "args": args,
                    })
                result.append(AIMessage(content=content, id=msg_id, tool_calls=lc_tool_calls))
            else:
                result.append(AIMessage(content=content, id=msg_id))
        elif role == "system":
            result.append(SystemMessage(content=content, id=msg_id))
        elif role == "tool":
            tool_call_id = msg.get("toolCallId", "")
            result.append(ToolMessage(content=content, id=msg_id, tool_call_id=tool_call_id))
    return result


# ---------------------------------------------------------------------------
# AG-UI SSE event helpers
# ---------------------------------------------------------------------------

def agui_event(event_type: str, data: dict[str, Any]) -> str:
    """Format an AG-UI SSE event as a plain-text SSE frame.

    Uses \\n line endings (not \\r\\n) because the AG-UI client's SSE parser
    splits on /\\n\\n/ to separate events.
    """
    payload = json.dumps({"type": event_type, **data})
    return f"data: {payload}\n\n"


# ---------------------------------------------------------------------------
# AG-UI streaming endpoint
# ---------------------------------------------------------------------------

@app.post("/agui")
async def agui_stream(request: Request):
    """AG-UI protocol endpoint -- accepts RunAgentInput, streams SSE events."""
    body = await request.json()

    thread_id = body.get("threadId", str(uuid.uuid4()))
    run_id = body.get("runId", str(uuid.uuid4()))
    messages = body.get("messages", [])
    state = body.get("state", {})

    # Convert AG-UI messages to LangChain format
    lc_messages = agui_messages_to_langchain(messages)

    # Build initial state for the graph
    tenant_id = state.get("tenant_id", settings.default_tenant_id)
    graph_input = {
        "messages": lc_messages,
        "tenant_id": tenant_id,
    }

    config = {"configurable": {"thread_id": thread_id}}

    async def event_generator():
        """Stream AG-UI events from the LangGraph agent."""
        # RUN_STARTED
        yield agui_event("RUN_STARTED", {"threadId": thread_id, "runId": run_id})

        try:
            # Run the LangGraph agent and collect the final state
            # We use invoke (not stream) since our mock LLM is synchronous
            # and the graph is simple enough. For production with real LLMs,
            # switch to astream_events for token-level streaming.
            result = await agent_graph.ainvoke(graph_input, config=config)
            result_messages: list[BaseMessage] = result.get("messages", [])

            # Find new messages (those produced by the agent, not the input)
            input_ids = {m.id for m in lc_messages if m.id}
            new_messages = [m for m in result_messages if m.id not in input_ids]

            for msg in new_messages:
                if isinstance(msg, AIMessage):
                    if msg.tool_calls:
                        # Emit tool call events for each tool call
                        for tc in msg.tool_calls:
                            tc_id = tc.get("id", str(uuid.uuid4()))
                            tc_name = tc.get("name", "unknown")
                            tc_args = tc.get("args", {})

                            yield agui_event("TOOL_CALL_START", {
                                "toolCallId": tc_id,
                                "toolCallName": tc_name,
                                "parentMessageId": msg.id or str(uuid.uuid4()),
                            })
                            yield agui_event("TOOL_CALL_ARGS", {
                                "toolCallId": tc_id,
                                "delta": json.dumps(tc_args),
                            })
                            yield agui_event("TOOL_CALL_END", {
                                "toolCallId": tc_id,
                            })

                    if msg.content:
                        # Emit text message events
                        msg_id = msg.id or str(uuid.uuid4())
                        yield agui_event("TEXT_MESSAGE_START", {
                            "messageId": msg_id,
                            "role": "assistant",
                        })

                        # Stream content in chunks for a more natural feel
                        content = msg.content
                        chunk_size = 20
                        for i in range(0, len(content), chunk_size):
                            chunk = content[i:i + chunk_size]
                            yield agui_event("TEXT_MESSAGE_CONTENT", {
                                "messageId": msg_id,
                                "delta": chunk,
                            })

                        yield agui_event("TEXT_MESSAGE_END", {
                            "messageId": msg_id,
                        })

                elif isinstance(msg, ToolMessage):
                    # Emit tool result
                    yield agui_event("TOOL_CALL_RESULT", {
                        "messageId": msg.id or str(uuid.uuid4()),
                        "toolCallId": msg.tool_call_id,
                        "content": msg.content if isinstance(msg.content, str) else json.dumps(msg.content),
                        "role": "tool",
                    })

            # Emit final state snapshot
            final_state = {
                k: v for k, v in result.items()
                if k != "messages"
            }
            if final_state:
                yield agui_event("STATE_SNAPSHOT", {
                    "snapshot": final_state,
                })

        except Exception as e:
            yield agui_event("RUN_ERROR", {
                "message": str(e),
                "code": "AGENT_ERROR",
            })
            return

        # RUN_FINISHED
        yield agui_event("RUN_FINISHED", {"threadId": thread_id, "runId": run_id})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "agent": "finops_assistant"}

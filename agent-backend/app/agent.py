"""FinOps Assistant -- LangGraph agent with AG-UI event streaming.

This agent uses a ReAct pattern to answer fintech operations questions.
It streams AG-UI protocol events back to the CopilotKit runtime.

AG-UI Event Flow:
1. RUN_STARTED -- signals the beginning of an agent run
2. TEXT_MESSAGE_START -> TEXT_MESSAGE_CONTENT (chunks) -> TEXT_MESSAGE_END -- streamed LLM response
3. TOOL_CALL_START -> TOOL_CALL_END -- when the agent invokes a tool
4. STATE_DELTA -- partial state updates pushed to the frontend
5. RUN_FINISHED -- signals the run is complete
"""
from __future__ import annotations

import json
import uuid
from typing import Any, Literal, TypedDict, Annotated

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.language_models import BaseChatModel
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode

from app.tools import get_transaction_summary, get_sla_compliance, get_payment_channel_breakdown
from app.llm import get_llm


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class FinOpsState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    tenant_id: str
    transaction_summary: dict
    current_intent: str


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a FinOps Assistant for a multi-tenant fintech platform. You help operations teams understand transaction volumes, SLA compliance, and payment channel performance.

When answering questions:
- Always use the tools available to fetch real data rather than making up numbers
- Present data clearly with key metrics highlighted
- Flag any SLA compliance issues proactively
- Suggest actionable next steps when appropriate

The current tenant is: {tenant_id}"""


TOOLS = [get_transaction_summary, get_sla_compliance, get_payment_channel_breakdown]


def build_agent(llm: BaseChatModel | None = None) -> StateGraph:
    """Construct the FinOps Assistant LangGraph graph."""
    if llm is None:
        llm = get_llm()

    llm_with_tools = llm.bind_tools(TOOLS)

    # --- node: call the model ---
    def call_model(state: FinOpsState) -> dict[str, Any]:
        tenant_id = state.get("tenant_id", "tenant-demo-001")
        system = SystemMessage(content=SYSTEM_PROMPT.format(tenant_id=tenant_id))
        messages = [system] + state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    # --- routing ---
    def should_continue(state: FinOpsState) -> Literal["tools", "__end__"]:
        last = state["messages"][-1]
        if isinstance(last, AIMessage) and last.tool_calls:
            return "tools"
        return "__end__"

    # --- build graph ---
    tool_node = ToolNode(TOOLS)

    graph = StateGraph(FinOpsState)
    graph.add_node("agent", call_model)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "__end__": END})
    graph.add_edge("tools", "agent")

    # CopilotKit SDK requires a checkpointer so it can call aget_state()
    memory = MemorySaver()
    return graph.compile(checkpointer=memory)


# Singleton compiled graph
agent_graph = build_agent()

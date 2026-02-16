"""LLM provider -- AWS Bedrock with automatic mock fallback."""
from __future__ import annotations

import json
import uuid
from typing import Any, Iterator, List, Optional, Sequence

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.tools import BaseTool
from pydantic import Field

from app.config import settings


def get_llm() -> BaseChatModel:
    """Return an LLM instance -- Bedrock if credentials exist, mock otherwise."""
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        try:
            from langchain_aws import ChatBedrock
            return ChatBedrock(
                model_id=settings.bedrock_model_id,
                region_name=settings.aws_region,
                credentials_profile_name=None,
                model_kwargs={"temperature": 0.3, "max_tokens": 2048},
            )
        except Exception:
            pass
    return MockLLM()


class MockLLM(BaseChatModel):
    """Deterministic mock LLM for local development without AWS credentials.

    Returns canned responses that demonstrate the agent flow including tool calls.
    """
    model_name: str = "mock-finops-llm"
    call_count: int = Field(default=0, exclude=True)

    @property
    def _llm_type(self) -> str:
        return "mock-finops"

    def bind_tools(
        self,
        tools: Sequence[Any],
        **kwargs: Any,
    ) -> MockLLM:
        """Mock bind_tools — returns self since tool routing is hardcoded."""
        return self

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        self.call_count += 1
        last_msg = messages[-1].content if messages else ""
        last_msg_lower = last_msg.lower() if isinstance(last_msg, str) else ""

        # Check if the most recent tool call just returned results
        # (i.e. the last message is a tool result, meaning we should summarize)
        last_is_tool_result = getattr(messages[-1], "type", None) == "tool" if messages else False

        if last_is_tool_result:
            # Summarize the tool results that just came back
            response = AIMessage(
                content=(
                    "Based on the data I retrieved, here's your FinOps summary:\n\n"
                    "**Transaction Volume**: Processing is healthy with volumes trending upward. "
                    "The success rate remains above 98%, well within SLA targets.\n\n"
                    "**SLA Compliance**: All primary metrics are currently compliant. "
                    "P95 latency is within the 300ms target.\n\n"
                    "**Payment Channels**: Credit cards lead at ~43% of volume, with digital wallets "
                    "showing the fastest growth quarter-over-quarter.\n\n"
                    "Would you like me to dive deeper into any specific area?"
                )
            )
        elif "transaction" in last_msg_lower or "summary" in last_msg_lower or "volume" in last_msg_lower:
            response = AIMessage(
                content="",
                tool_calls=[{
                    "id": f"call_{uuid.uuid4().hex[:8]}",
                    "name": "get_transaction_summary",
                    "args": {"tenant_id": "tenant-demo-001", "date_range": "7d"},
                }],
            )
        elif "sla" in last_msg_lower or "compliance" in last_msg_lower or "uptime" in last_msg_lower:
            response = AIMessage(
                content="",
                tool_calls=[{
                    "id": f"call_{uuid.uuid4().hex[:8]}",
                    "name": "get_sla_compliance",
                    "args": {"tenant_id": "tenant-demo-001"},
                }],
            )
        elif "channel" in last_msg_lower or "payment" in last_msg_lower or "breakdown" in last_msg_lower:
            response = AIMessage(
                content="",
                tool_calls=[{
                    "id": f"call_{uuid.uuid4().hex[:8]}",
                    "name": "get_payment_channel_breakdown",
                    "args": {"tenant_id": "tenant-demo-001"},
                }],
            )
        else:
            response = AIMessage(
                content=(
                    "Hello! I'm your FinOps Assistant. I can help you with:\n\n"
                    "- **Transaction summaries** -- volume, success rates, and trends\n"
                    "- **SLA compliance** -- uptime, latency percentiles, and incident tracking\n"
                    "- **Payment channel breakdown** -- volume distribution and performance by channel\n\n"
                    "What would you like to know about your tenant's operations?"
                )
            )

        return ChatResult(generations=[ChatGeneration(message=response)])

# Testing Strategy

<!-- reviewed: 2026-02-16 -->

## Current State

This project does not yet have automated tests. The sections below document the intended strategy and setup steps.

## Frontend (frontend/)

### Runner: Vitest (recommended)

Not yet configured. To add:

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### What to Test

| Layer | What | How |
|-------|------|-----|
| Render components | `TransactionSummaryRender`, `SlaComplianceRender`, `ChannelBreakdownRender` | Unit tests with mock props (`status: "complete"`, `result: {...}`) |
| Context | `ToolResultsProvider` | Test `pushResult`, `selectResult`, deduplication logic |
| Utilities | `cn()`, `formatCurrency()`, `formatNumber()`, `formatPercent()` | Pure function unit tests |
| Pages | Dashboard page, Agent page | Smoke tests — renders without crashing |

### What NOT to Test

- Shadcn/ui primitives (tested upstream)
- CopilotKit integration (requires runtime, test via e2e)
- Tremor chart rendering (SVG internals are fragile)

---

## Backend (agent-backend/)

### Runner: pytest

Not yet configured. To add:

```bash
cd agent-backend
uv pip install --system pytest pytest-asyncio httpx
```

### What to Test

| Layer | What | How |
|-------|------|-----|
| Tools | `get_transaction_summary`, `get_sla_compliance`, `get_payment_channel_breakdown` | Call directly, assert return schema matches frontend expectations |
| Mock data | `app/mock_data.py` generators | Assert required keys present, value ranges reasonable |
| Message conversion | `agui_messages_to_langchain()` | Unit test with sample AG-UI message payloads |
| SSE formatting | `agui_event()` | Assert `data: {json}\n\n` format, no `\r\n` |
| Agent graph | `agent_graph.ainvoke()` | Integration test with MockLLM, assert tool calls are routed correctly |
| Health endpoint | `GET /health` | httpx `TestClient`, assert 200 + JSON body |

### What NOT to Test

- AWS Bedrock integration (requires credentials, test via staging)
- LangGraph internals (tested upstream)

---

## E2E Testing (cross-stack)

### Runner: Playwright (recommended)

Not yet configured. Would test the full flow:
1. Load `/dashboard/agent`
2. Type "Show me transaction volume"
3. Assert: compact card appears in chat
4. Assert: full visualization appears in right panel
5. Type "Check SLA compliance"
6. Assert: right panel updates to SLA view
7. Click previous transaction card in chat
8. Assert: right panel switches back to transaction view

### Key Assertions for E2E

- AG-UI SSE stream completes (RUN_STARTED -> ... -> RUN_FINISHED)
- Tool results render both inline (compact) and in panel (full)
- Chat scrolls when messages exceed viewport
- Navigation between Dashboard and Agent pages preserves sidebar state

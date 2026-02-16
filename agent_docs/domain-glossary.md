# Domain Glossary

<!-- reviewed: 2026-02-16 -->

Maps domain terms to their code representations in both frontend (TypeScript) and backend (Python).

## Core Entities

| Domain Term | Frontend (TypeScript) | Backend (Python) | Description |
|-------------|----------------------|-------------------|-------------|
| **Tenant** | `getTenantInfo()` in `lib/mock-data.ts` returns `{ id, name, plan }` | `settings.default_tenant_id` in `config.py`; `tenant_id: str` in `FinOpsState` | A customer organization on the multi-tenant platform. Identified by `tenant-demo-001`. |
| **Transaction** | `TransactionSummaryData` interface in `transaction-summary-render.tsx` | Return type of `get_transaction_summary()` in `mock_data.py` | A single payment event with volume count and USD amount. |
| **Daily Breakdown** | `{ date: string; volume: number; amount_usd: number }[]` in `TransactionSummaryData.daily_breakdown` | `daily_volumes` list in `mock_data.get_transaction_summary()` | Per-day transaction aggregation over a date range. |
| **Top Merchant** | `{ name: string; volume: number; amount_usd: number }[]` in `TransactionSummaryData.top_merchants` | `top_merchants` list in `mock_data.get_transaction_summary()` | Highest-volume payment processors (Stripe, PayPal, Square, etc). |
| **SLA Target** | `sla_targets: { uptime_target_pct, p95_latency_target_ms, error_rate_target_pct }` in `SlaComplianceData` | `sla_targets` dict in `mock_data.get_sla_compliance()` | Contractual thresholds for uptime, latency, and error rate. |
| **Compliance Status** | `compliance_status: { uptime, latency, error_rate }` with values `"COMPLIANT" \| "AT_RISK" \| "NON_COMPLIANT"` | `compliance_status` dict with same string values | Whether each SLA metric meets its target. |
| **Payment Channel** | `ChannelData` interface: `{ channel, volume_pct, avg_ticket_usd, success_rate_pct }` | `channels` list in `mock_data.get_payment_channel_breakdown()` | A payment method type (Credit Card, Debit Card, ACH, Digital Wallet, Wire Transfer). |
| **Latency Percentile** | `p50_latency_ms`, `p95_latency_ms`, `p99_latency_ms` in `SlaComplianceData` | Same field names in `mock_data.get_sla_compliance()` return dict | Response time distribution markers. P95 = 95% of requests complete within this time. |

## AG-UI Protocol Terms

| Term | Where Used | Description |
|------|-----------|-------------|
| **Run** | `threadId` + `runId` in SSE events | A single agent invocation. Contains multiple messages and tool calls. |
| **Thread** | `threadId` in `RunAgentInput` body | A conversation session. Persists across multiple runs via MemorySaver. |
| **RunAgentInput** | POST body to `/agui` | AG-UI request format: `{ threadId, runId, messages[], state }`. |
| **SSE Event** | `data: {json}\n\n` frames | Server-Sent Event carrying AG-UI protocol events. |
| **Tool Call** | `TOOL_CALL_START/ARGS/END` events | Agent's request to execute a tool function. |
| **Tool Result** | `TOOL_CALL_RESULT` event | Return value from tool execution, sent as JSON string. |
| **State Snapshot** | `STATE_SNAPSHOT` event | Non-message fields from the LangGraph state (e.g., `tenant_id`). |

## UI Terms

| Term | Component | Description |
|------|-----------|-------------|
| **Results Panel** | `ResultsPanel` in `results-panel.tsx` | Right column showing full-width tool visualizations or welcome state. |
| **Inline Tool Card** | `InlineToolCard` in `agent-actions.tsx` | Compact clickable card in chat showing tool name + status icon. |
| **Welcome State** | `WelcomeState` in `results-panel.tsx` | Default right panel content: Bot icon + prompt suggestions. |
| **Active Result** | `activeResult` in `ToolResultsContext` | The tool result currently displayed in the Results Panel (selected or latest). |

## Tool Name Contract

These names MUST match exactly across the stack:

| Tool Name | Frontend (`useCopilotAction`) | Backend (`@tool`) | Render Component |
|-----------|-------------------------------|-------------------|-----------------|
| `get_transaction_summary` | `agent-actions.tsx` | `tools.py` | `TransactionSummaryRender` |
| `get_sla_compliance` | `agent-actions.tsx` | `tools.py` | `SlaComplianceRender` |
| `get_payment_channel_breakdown` | `agent-actions.tsx` | `tools.py` | `ChannelBreakdownRender` |

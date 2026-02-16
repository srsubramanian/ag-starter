# Architecture -- Detailed Diagrams

<!-- reviewed: 2026-02-16 -->

## Request Flow (User Message -> Agent Response)

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js :3000
    participant CR as CopilotKit Runtime<br/>/api/copilotkit
    participant F as FastAPI :8000<br/>/agui
    participant AG as LangGraph Agent
    participant LLM as LLM (Bedrock/Mock)
    participant T as Tool Functions

    B->>N: User types message
    N->>CR: POST /api/copilotkit<br/>(CopilotKit SDK)
    CR->>F: POST /agui<br/>(AG-UI RunAgentInput)
    F->>F: Convert AG-UI msgs<br/>to LangChain msgs
    F->>AG: ainvoke(messages, config)

    loop ReAct Loop
        AG->>LLM: invoke(system + messages)
        LLM-->>AG: AIMessage (text or tool_calls)
        alt Has tool_calls
            AG->>T: Execute tool function
            T-->>AG: ToolMessage (JSON result)
        end
    end

    AG-->>F: Final state (all messages)

    F-->>CR: SSE stream:<br/>RUN_STARTED<br/>TOOL_CALL_START/ARGS/END<br/>TOOL_CALL_RESULT<br/>TEXT_MESSAGE_START/CONTENT/END<br/>RUN_FINISHED
    CR-->>N: Forward SSE events
    N-->>B: CopilotKit renders:<br/>- Inline tool cards in chat<br/>- Full viz in ResultsPanel<br/>- Streaming text
```

## Frontend Component Tree

```mermaid
graph TD
    Root["RootLayout<br/>(font, globals.css)"]
    DL["DashboardLayout<br/>(sidebar + header + main)"]
    SN["SidebarNav<br/>(w-16, icon-only)"]
    HB["HeaderBar<br/>(h-14, page title)"]

    DP["DashboardPage<br/>(KPIs + charts)"]
    AP["AgentPage<br/>(CopilotKit provider)"]

    CK["CopilotKit<br/>(runtimeUrl, agent)"]
    TRP["ToolResultsProvider<br/>(context)"]
    AA["AgentActions<br/>(useCopilotAction x3)"]
    AC["AgentChat<br/>(CopilotChat embed)"]
    RP["ResultsPanel<br/>(active result or welcome)"]

    ITC["InlineToolCard<br/>(compact, clickable)"]
    TSR["TransactionSummaryRender"]
    SCR["SlaComplianceRender"]
    CBR["ChannelBreakdownRender"]

    Root --> DL
    DL --> SN
    DL --> HB
    DL --> DP
    DL --> AP
    AP --> CK
    CK --> TRP
    TRP --> AA
    TRP --> AC
    TRP --> RP
    AA -.->|"render callback"| ITC
    RP -.->|"maps toolName"| TSR
    RP -.->|"maps toolName"| SCR
    RP -.->|"maps toolName"| CBR
```

## Backend Module Dependency

```mermaid
graph TD
    M["main.py<br/>(FastAPI + SSE)"]
    A["agent.py<br/>(LangGraph graph)"]
    T["tools.py<br/>(@tool wrappers)"]
    L["llm.py<br/>(get_llm + MockLLM)"]
    C["config.py<br/>(Settings)"]
    MD["mock_data.py<br/>(data generators)"]

    M --> A
    M --> C
    A --> T
    A --> L
    T --> MD
    L --> C
```

## Data Flow: Tool Result -> UI

```mermaid
graph LR
    BE["Backend<br/>TOOL_CALL_RESULT SSE"]
    CK["CopilotKit Runtime<br/>(parses SSE)"]
    RA["useCopilotAction<br/>render callback"]
    PR["pushResult()<br/>(queueMicrotask)"]
    CTX["ToolResultsContext<br/>(results[], selectedToolName)"]
    IC["InlineToolCard<br/>(chat, compact)"]
    RP["ResultsPanel<br/>(right column, full)"]

    BE -->|SSE| CK
    CK -->|"trigger render"| RA
    RA --> PR
    RA --> IC
    PR -->|"deferred setState"| CTX
    CTX -->|"activeResult"| RP
    IC -->|"onClick: selectResult()"| CTX
```

## Deployment Topology

```mermaid
graph TB
    subgraph "Development (local)"
        NL["Next.js dev :3000"]
        FL["FastAPI dev :8000"]
        ML["MockLLM<br/>(no credentials)"]
        NL --> FL
        FL --> ML
    end

    subgraph "Production (Docker)"
        NG["Next.js standalone<br/>(Docker)"]
        FP["FastAPI<br/>(Docker, uvicorn)"]
        BR["AWS Bedrock<br/>Claude Sonnet 4"]
        NG --> FP
        FP --> BR
    end
```

## AG-UI Protocol Event Types

| Event | Direction | Purpose |
|-------|-----------|---------|
| `RUN_STARTED` | Server -> Client | Signals agent run begins |
| `TEXT_MESSAGE_START` | Server -> Client | Opens a new text message |
| `TEXT_MESSAGE_CONTENT` | Server -> Client | Streamed text chunk (20 chars) |
| `TEXT_MESSAGE_END` | Server -> Client | Closes the text message |
| `TOOL_CALL_START` | Server -> Client | Agent wants to call a tool |
| `TOOL_CALL_ARGS` | Server -> Client | Tool arguments (JSON delta) |
| `TOOL_CALL_END` | Server -> Client | Tool call metadata complete |
| `TOOL_CALL_RESULT` | Server -> Client | Tool execution result |
| `STATE_SNAPSHOT` | Server -> Client | Full agent state (non-message fields) |
| `RUN_ERROR` | Server -> Client | Error during execution |
| `RUN_FINISHED` | Server -> Client | Agent run complete |

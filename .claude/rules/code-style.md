# Code Style -- What Linters Miss

<!-- reviewed: 2026-02-16 -->

## React / TypeScript (frontend/)

### File Organization

| Directory | Purpose | Naming |
|-----------|---------|--------|
| `src/app/` | Next.js App Router pages + API routes | `page.tsx`, `layout.tsx`, `route.ts` |
| `src/components/ui/` | Shadcn/ui primitives (Radix-based) | PascalCase: `button.tsx`, `card.tsx` |
| `src/components/dashboard/` | Dashboard-specific composed components | kebab-case: `kpi-cards.tsx` |
| `src/components/agent/` | Agent chat + tool render components | kebab-case: `agent-chat.tsx` |
| `src/components/agent/renders/` | Per-tool visualization components | kebab-case: `transaction-summary-render.tsx` |
| `src/contexts/` | React contexts + providers | kebab-case: `tool-results-context.tsx` |
| `src/lib/` | Pure utility functions | kebab-case: `mock-data.ts`, `utils.ts` |

### Component Patterns

- **One export per file** -- each component file exports a single named function component. No default exports (Next.js page/layout files excepted).
- **Props interfaces co-located** -- define `interface FooProps` in the same file as the component, not in a separate types file.
- **Compound components via shadcn pattern** -- `Card`, `CardHeader`, `CardTitle`, `CardContent` exported from one file using `React.forwardRef`.
- **Icon imports** -- use `lucide-react` for all icons. Import individual icons: `import { Bot, Zap } from "lucide-react"`.
- **Class merging** -- always use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`). Never concatenate class strings manually.

### CopilotKit Patterns

- **Render-only actions**: Set `available: "disabled"` on `useCopilotAction`. The backend owns tool execution; the frontend only renders results.
- **Tool name contract**: The `name` field in `useCopilotAction` MUST exactly match the Python `@tool` function name. No aliases.
- **Inline vs panel renders**: Chat shows compact `InlineToolCard` (icon + label + status). Full visualization renders only in `ResultsPanel`.

### Styling

- **Tailwind only** -- no CSS modules, styled-components, or inline styles. Exception: CopilotKit's own `styles.css` import.
- **Semantic color tokens** -- use `bg-card`, `text-muted-foreground`, `border-primary/10` etc. Never raw colors like `bg-blue-500` except for accent icons.
- **shadcn/ui charts (Recharts v3)** -- use `ChartContainer` + `ChartConfig` from `@/components/ui/chart` for all data visualizations. Wrap Recharts primitives (`AreaChart`, `BarChart`, `PieChart`) inside `ChartContainer`. Chart colors come from CSS variables (`--chart-1` through `--chart-5`) defined in `globals.css`. For non-chart components like horizontal bar lists and segmented bars, use custom Tailwind layouts instead of a chart library.

---

## Python (agent-backend/)

### File Organization

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app, CORS, AG-UI SSE endpoint, message conversion |
| `app/agent.py` | LangGraph graph definition, state schema, system prompt |
| `app/tools.py` | `@tool` decorated functions (thin wrappers around data sources) |
| `app/llm.py` | LLM provider factory (`get_llm()`) + MockLLM for local dev |
| `app/config.py` | Pydantic Settings (reads `.env`) |
| `app/mock_data.py` | Realistic mock data generators for all tools |

### Conventions

- **Ruff for formatting + linting** -- target `py311`, line-length `100`. Ruff handles import sorting and style. Don't restate what Ruff enforces.
- **Type hints everywhere** -- all function signatures MUST have return type annotations. Use `TypedDict` for LangGraph state, not dataclasses.
- **`@tool` decorator** -- all LangGraph tools use `@tool` from `langchain_core.tools`. Docstrings become the tool description for the LLM. Write clear, concise docstrings with `Args:` sections.
- **Settings singleton** -- `from app.config import settings`. Never read `os.environ` directly.
- **SSE formatting** -- `data: {json}\n\n` with `\n` line endings only. The AG-UI client parser breaks on `\r\n`.

### LangGraph Patterns

- **ReAct loop** -- `agent` node calls LLM -> conditional edge checks for `tool_calls` -> `tools` node (ToolNode) executes -> loops back to `agent`.
- **MemorySaver checkpointer** -- required by CopilotKit for `aget_state()`. Thread ID comes from AG-UI `threadId`.
- **Singleton graph** -- `agent_graph = build_agent()` at module level. Do not rebuild per request.

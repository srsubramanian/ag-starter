"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";

export interface ToolResult {
  toolName: string;
  status: "inProgress" | "executing" | "complete";
  result: unknown;
  timestamp: number;
}

interface ToolResultsContextValue {
  results: ToolResult[];
  latestResult: ToolResult | null;
  pushResult: (toolName: string, status: string, result: unknown) => void;
}

const ToolResultsContext = createContext<ToolResultsContextValue | null>(null);

export function ToolResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<ToolResult[]>([]);
  const pendingRef = useRef<ToolResult | null>(null);
  const scheduledRef = useRef(false);

  const pushResult = useCallback(
    (toolName: string, status: string, result: unknown) => {
      const entry: ToolResult = {
        toolName,
        status: status as ToolResult["status"],
        result,
        timestamp: Date.now(),
      };

      // Defer state update to avoid render-during-render warnings
      // (CopilotKit render props execute during React render phase)
      pendingRef.current = entry;
      if (!scheduledRef.current) {
        scheduledRef.current = true;
        queueMicrotask(() => {
          scheduledRef.current = false;
          const pending = pendingRef.current;
          if (!pending) return;
          setResults((prev) => {
            const idx = prev.findIndex((r) => r.toolName === pending.toolName);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = pending;
              return next;
            }
            return [...prev, pending];
          });
        });
      }
    },
    [],
  );

  const latestResult =
    results.length > 0
      ? results.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b))
      : null;

  return (
    <ToolResultsContext.Provider value={{ results, latestResult, pushResult }}>
      {children}
    </ToolResultsContext.Provider>
  );
}

export function useToolResults() {
  const ctx = useContext(ToolResultsContext);
  if (!ctx) {
    throw new Error("useToolResults must be used within a ToolResultsProvider");
  }
  return ctx;
}

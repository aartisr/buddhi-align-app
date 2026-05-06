"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type CopilotDiagnosticsPayload = {
  generatedAt?: string;
  runtime?: {
    provider?: string;
    enabled?: boolean;
    hostedConfigured?: boolean;
  };
  checks?: {
    localCorpus?: { ok?: boolean; documentCount?: number; error?: string };
    localRetrieval?: { ok?: boolean; resultCount?: number; latencyMs?: number; error?: string };
    hostedRetrieval?: { configured?: boolean; ok?: boolean; resultCount?: number; latencyMs?: number; error?: string };
  };
  summary?: {
    ok?: boolean;
    issues?: string[];
    warnings?: string[];
  };
};

function boolLabel(value: boolean | undefined): string {
  return value ? "yes" : "no";
}

export default function CopilotDiagnosticsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<CopilotDiagnosticsPayload | null>(null);

  const loadDiagnostics = useCallback(async (): Promise<CopilotDiagnosticsPayload> => {
    const response = await fetch("/api/admin/diagnostics/copilot", {
      cache: "no-store",
      credentials: "same-origin",
    });

    const data = (await response.json()) as CopilotDiagnosticsPayload | { error?: string };
    if (!response.ok) {
      const message = typeof (data as { error?: string })?.error === "string"
        ? (data as { error?: string }).error
        : `Diagnostics request failed with ${response.status}`;
      throw new Error(message);
    }

    return data as CopilotDiagnosticsPayload;
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await loadDiagnostics();
        if (active) setPayload(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load diagnostics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [loadDiagnostics]);

  async function refreshNow() {
    setLoading(true);
    setError(null);
    try {
      const data = await loadDiagnostics();
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load diagnostics.");
    } finally {
      setLoading(false);
    }
  }

  const summary = payload?.summary;
  const runtime = payload?.runtime;
  const checks = payload?.checks;
  const issueItems = useMemo(() => summary?.issues ?? [], [summary?.issues]);
  const warningItems = useMemo(() => summary?.warnings ?? [], [summary?.warnings]);

  return (
    <article className="app-record-card" data-testid="copilot-diagnostics-panel">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="font-semibold">Copilot retrieval diagnostics</h4>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs app-copy-soft">loading...</span>
          ) : summary?.ok ? (
            <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              healthy
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              attention needed
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              void refreshNow();
            }}
            className="app-user-action px-2 py-1 rounded text-xs"
            disabled={loading}
            data-testid="copilot-diagnostics-refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-700 dark:text-red-300" data-testid="copilot-diagnostics-error">
          {error}
        </p>
      ) : null}

      {!error && !loading ? (
        <div className="space-y-2 text-sm">
          <p className="app-copy-soft" data-testid="copilot-diagnostics-runtime">
            provider={runtime?.provider ?? "n/a"} · enabled={boolLabel(runtime?.enabled)} · hosted={boolLabel(runtime?.hostedConfigured)}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <p className="app-copy-soft">corpus: <strong className="app-copy">{checks?.localCorpus?.documentCount ?? 0}</strong></p>
            <p className="app-copy-soft">local probe: <strong className="app-copy">{boolLabel(checks?.localRetrieval?.ok)}</strong></p>
            <p className="app-copy-soft">local latency: <strong className="app-copy">{checks?.localRetrieval?.latencyMs ?? 0}ms</strong></p>
            <p className="app-copy-soft">hosted probe: <strong className="app-copy">{checks?.hostedRetrieval?.configured ? boolLabel(checks?.hostedRetrieval?.ok) : "not configured"}</strong></p>
          </div>

          {issueItems.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Issues</p>
              <ul className="list-disc pl-5 text-xs app-copy-soft" data-testid="copilot-diagnostics-issues">
                {issueItems.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {warningItems.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Warnings</p>
              <ul className="list-disc pl-5 text-xs app-copy-soft" data-testid="copilot-diagnostics-warnings">
                {warningItems.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs app-copy-soft" data-testid="copilot-diagnostics-updated">
            Updated: {payload?.generatedAt ?? "n/a"}
          </p>
        </div>
      ) : null}
    </article>
  );
}

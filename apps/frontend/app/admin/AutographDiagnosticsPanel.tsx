"use client";

import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type DiagnosticsPayload = {
  generatedAt?: string;
  checks?: {
    providerInitialization?: { ok?: boolean; error?: string };
    storageProbe?: { ok?: boolean; error?: string };
    supabaseServiceRoleClaim?: string | null;
    authSecretConfigured?: boolean;
    supabaseUrlConfigured?: boolean;
    supabaseServiceRoleKeyConfigured?: boolean;
  };
  runtime?: {
    dataProvider?: string;
    projectRef?: string | null;
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

export default function AutographDiagnosticsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<DiagnosticsPayload | null>(null);

  const loadDiagnostics = useCallback(async (): Promise<DiagnosticsPayload> => {
    const response = await fetch("/api/admin/diagnostics/autograph", {
      cache: "no-store",
      credentials: "same-origin",
    });

    const data = (await response.json()) as DiagnosticsPayload | { error?: string };

    if (!response.ok) {
      const message = typeof (data as { error?: string })?.error === "string"
        ? (data as { error?: string }).error
        : `Diagnostics request failed with ${response.status}`;
      throw new Error(message);
    }

    return data as DiagnosticsPayload;
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await loadDiagnostics();

        if (active) {
          setPayload(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load diagnostics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
  const checks = payload?.checks;
  const runtime = payload?.runtime;

  const issueItems = useMemo(() => summary?.issues ?? [], [summary?.issues]);
  const warningItems = useMemo(() => summary?.warnings ?? [], [summary?.warnings]);

  return (
    <article className="app-record-card" data-testid="autograph-diagnostics-panel">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="font-semibold">Autograph persistence diagnostics</h4>
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
            data-testid="autograph-diagnostics-refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-700 dark:text-red-300" data-testid="autograph-diagnostics-error">
          {error}
        </p>
      ) : null}

      {!error && !loading ? (
        <div className="space-y-2 text-sm">
          <p className="app-copy-soft" data-testid="autograph-diagnostics-runtime">
            provider={runtime?.dataProvider ?? "n/a"} · project={runtime?.projectRef ?? "n/a"} · role={checks?.supabaseServiceRoleClaim ?? "n/a"}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <p className="app-copy-soft">AUTH_SECRET: <strong className="app-copy">{boolLabel(checks?.authSecretConfigured)}</strong></p>
            <p className="app-copy-soft">SUPABASE_URL: <strong className="app-copy">{boolLabel(checks?.supabaseUrlConfigured)}</strong></p>
            <p className="app-copy-soft">SERVICE_ROLE_KEY: <strong className="app-copy">{boolLabel(checks?.supabaseServiceRoleKeyConfigured)}</strong></p>
            <p className="app-copy-soft">provider init: <strong className="app-copy">{boolLabel(checks?.providerInitialization?.ok)}</strong></p>
            <p className="app-copy-soft">storage probe: <strong className="app-copy">{boolLabel(checks?.storageProbe?.ok)}</strong></p>
          </div>

          {issueItems.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Issues</p>
              <ul className="list-disc pl-5 text-xs app-copy-soft" data-testid="autograph-diagnostics-issues">
                {issueItems.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {warningItems.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Warnings</p>
              <ul className="list-disc pl-5 text-xs app-copy-soft" data-testid="autograph-diagnostics-warnings">
                {warningItems.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs app-copy-soft" data-testid="autograph-diagnostics-updated">
            Updated: {payload?.generatedAt ?? "n/a"}
          </p>
        </div>
      ) : null}
    </article>
  );
}

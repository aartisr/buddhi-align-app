"use client";
import React from "react";
import { useRef, useState } from "react";
import { useI18n } from "../i18n/provider";
import { logEvent } from "../lib/logEvent";

type ImportStatus = "idle" | "loading" | "success" | "error";

const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
const IMPORT_TIMEOUT_MS = 15_000;

function isReauthError(error?: string): boolean {
  if (!error) return false;
  return /OIDC|re-authentication/i.test(error);
}

export default function DataPortability() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importMessage, setImportMessage] = useState("");

  const handleExport = () => {
    // Trigger download via anchor pointing to the streaming JSON endpoint
    const a = document.createElement("a");
    a.href = "/api/data/export";
    a.download = `buddhi-align-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logEvent("data_export_triggered");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset for re-use
    if (fileInputRef.current) fileInputRef.current.value = "";

    setImportStatus("loading");
    setImportMessage("");

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setImportStatus("error");
      setImportMessage(t("settings.import.errorTooLarge"));
      logEvent("data_import_failed", { reason: "file_too_large", bytes: file.size });
      return;
    }

    try {
      const text = await file.text();
      const archive = JSON.parse(text);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);

      const res = await fetch("/api/data/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(archive),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const result = await res.json();

      if (!res.ok) {
        setImportStatus("error");
        if (res.status === 401 || res.status === 403 || isReauthError(result.error)) {
          setImportMessage(t("settings.import.reauthRequired"));
        } else {
          setImportMessage(result.error ?? t("settings.import.errorGeneric"));
        }
        logEvent("data_import_failed", { reason: result.error ?? "http_error" });
        return;
      }

      const totalImported = Object.values(
        result.results as Record<string, { imported: number; errors: number }>
      ).reduce((s, r) => s + r.imported, 0);

      setImportStatus("success");
      setImportMessage(t("settings.import.success").replace("{{count}}", String(totalImported)));
      logEvent("data_import_success", { totalImported });
    } catch (error) {
      setImportStatus("error");
      if (error instanceof DOMException && error.name === "AbortError") {
        setImportMessage(t("settings.import.errorTimeout"));
        logEvent("data_import_failed", { reason: "timeout" });
      } else {
        setImportMessage(t("settings.import.errorGeneric"));
        logEvent("data_import_failed", { reason: "exception" });
      }
    }
  };

  return (
    <div className="app-data-portability mt-6 pt-6 border-t border-(--border-soft)">
      <h4 className="app-panel-title font-bold text-base mb-1">{t("settings.data.title")}</h4>
      <p className="app-copy-soft text-sm mb-4">{t("settings.data.subtitle")}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Export */}
        <button
          className="app-data-export-btn"
          onClick={handleExport}
          disabled={importStatus === "loading"}
          aria-label={t("settings.export.label")}
        >
          ⬇ {t("settings.export.label")}
        </button>

        {/* Import */}
        <button
          className="app-data-import-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={importStatus === "loading"}
          aria-label={t("settings.import.label")}
        >
          {importStatus === "loading" ? "⏳" : "⬆"} {t("settings.import.label")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
          aria-hidden="true"
        />
      </div>

      {/* Status feedback */}
      {importStatus === "success" && (
        <p className="app-import-success mt-3 text-sm">{importMessage}</p>
      )}
      {importStatus === "error" && (
        <p className="app-import-error mt-3 text-sm">{importMessage}</p>
      )}

      <p className="app-copy-soft text-xs mt-3">{t("settings.data.note")}</p>
    </div>
  );
}

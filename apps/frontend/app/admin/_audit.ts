import { createDataProvider } from "@buddhi-align/data-access";

export const ADMIN_AUDIT_MODULE = "__admin_audit";

export interface AdminAuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  [key: string]: unknown;
}

export async function writeAdminAudit(entry: Omit<AdminAuditEntry, "id" | "at"> & { at?: string }) {
  const provider = createDataProvider();
  await provider.create<AdminAuditEntry>(
    ADMIN_AUDIT_MODULE,
    {
      at: entry.at ?? new Date().toISOString(),
      actor: entry.actor,
      action: entry.action,
      detail: entry.detail,
      severity: entry.severity,
    },
  );
}

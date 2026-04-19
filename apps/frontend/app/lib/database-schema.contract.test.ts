import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readWorkspaceFile(relativePathFromRepoRoot: string): string {
  const filePath = path.resolve(__dirname, "../../../..", relativePathFromRepoRoot);
  return fs.readFileSync(filePath, "utf8");
}

describe("Supabase schema contract", () => {
  const schemaSql = readWorkspaceFile("supabase/schema.sql");
  const recommendationDoc = readWorkspaceFile("docs/world-class-generic-schema-recommendations.md");

  it("defines canonical object table with backward-compatible generic payload", () => {
    expect(schemaSql).toMatch(/CREATE TABLE IF NOT EXISTS module_entries/i);
    expect(schemaSql).toMatch(/module\s+TEXT\s+NOT NULL/i);
    expect(schemaSql).toMatch(/data\s+JSONB\s+NOT NULL DEFAULT '\{\}'/i);
    expect(schemaSql).toMatch(/tenant_id\s+TEXT\s+NOT NULL DEFAULT 'default'/i);
    expect(schemaSql).toMatch(/owner_subject\s+TEXT/i);
    expect(schemaSql).toMatch(/scope\s+TEXT\s+NOT NULL DEFAULT 'private'/i);
    expect(schemaSql).toMatch(/status\s+TEXT\s+NOT NULL DEFAULT 'active'/i);
    expect(schemaSql).toMatch(/version\s+BIGINT\s+NOT NULL DEFAULT 1/i);
  });

  it("includes additive migration path for existing deployments", () => {
    expect(schemaSql).toMatch(/ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS tenant_id/i);
    expect(schemaSql).toMatch(/ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS deleted_at/i);
    expect(schemaSql).toMatch(/DO \$\$[\s\S]*module_entries_scope_valid[\s\S]*END \$\$/i);
  });

  it("enforces integrity constraints for module entries", () => {
    expect(schemaSql).toContain("module_entries_module_nonempty");
    expect(schemaSql).toContain("module_entries_scope_valid");
    expect(schemaSql).toContain("module_entries_status_valid");
    expect(schemaSql).toContain("module_entries_version_positive");
    expect(schemaSql).toMatch(/CHECK \(scope IN \('private', 'shared', 'public'\)\)/i);
    expect(schemaSql).toMatch(/CHECK \(status IN \('active', 'archived', 'deleted'\)\)/i);
  });

  it("defines write-safety triggers and helper functions", () => {
    expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION _buddhi_update_updated_at_and_version\(\)/i);
    expect(schemaSql).toMatch(/CREATE TRIGGER module_entries_updated_at/i);
    expect(schemaSql).toMatch(/NEW\.updated_at = NOW\(\)/i);
    expect(schemaSql).toMatch(/NEW\.version = OLD\.version \+ 1/i);
  });

  it("adds query-path indexes for tenant/module/owner and JSON payload", () => {
    expect(schemaSql).toMatch(/idx_module_entries_tenant_module_created/i);
    expect(schemaSql).toMatch(/idx_module_entries_tenant_owner_created/i);
    expect(schemaSql).toMatch(/idx_module_entries_status/i);
    expect(schemaSql).toMatch(/idx_module_entries_data_gin/i);
    expect(schemaSql).toMatch(/idx_module_entries_dedupe_per_tenant/i);
  });

  it("defines append-only events table with idempotency and replay indexes", () => {
    expect(schemaSql).toMatch(/CREATE TABLE IF NOT EXISTS module_entry_events/i);
    expect(schemaSql).toMatch(/event_id\s+BIGINT\s+GENERATED ALWAYS AS IDENTITY PRIMARY KEY/i);
    expect(schemaSql).toMatch(/REFERENCES module_entries\(id\) ON DELETE CASCADE/i);
    expect(schemaSql).toMatch(/idx_module_entry_events_entry_time/i);
    expect(schemaSql).toMatch(/idx_module_entry_events_tenant_module_time/i);
    expect(schemaSql).toMatch(/idx_module_entry_events_idempotency/i);
  });

  it("keeps the core schema table set minimal and intentional", () => {
    const tableNames = Array.from(
      schemaSql.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)/gi),
      (m) => m[1],
    );

    expect(tableNames).toEqual([
      "module_entries",
      "module_entry_events",
      "module_entry_projections",
    ]);
  });

  it("defines projections table for read-optimized workloads", () => {
    expect(schemaSql).toMatch(/CREATE TABLE IF NOT EXISTS module_entry_projections/i);
    expect(schemaSql).toMatch(/entry_id\s+UUID\s+PRIMARY KEY REFERENCES module_entries\(id\) ON DELETE CASCADE/i);
    expect(schemaSql).toMatch(/projection\s+JSONB\s+NOT NULL DEFAULT '\{\}'/i);
    expect(schemaSql).toMatch(/idx_module_entry_projections_tenant_module_updated/i);
    expect(schemaSql).toMatch(/idx_module_entry_projections_projection_gin/i);
    expect(schemaSql).toContain("module_entry_projections_current_status_valid");
  });

  it("enables RLS hardening with deny-client default policies", () => {
    expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION buddhi_current_tenant\(\)/i);
    expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION buddhi_current_subject\(\)/i);
    expect(schemaSql).toMatch(/ALTER TABLE module_entries ENABLE ROW LEVEL SECURITY/i);
    expect(schemaSql).toMatch(/ALTER TABLE module_entry_events ENABLE ROW LEVEL SECURITY/i);
    expect(schemaSql).toMatch(/ALTER TABLE module_entry_projections ENABLE ROW LEVEL SECURITY/i);
    expect(schemaSql).toMatch(/CREATE POLICY module_entries_deny_client_access/i);
    expect(schemaSql).toMatch(/CREATE POLICY module_entry_events_deny_client_access/i);
    expect(schemaSql).toMatch(/CREATE POLICY module_entry_projections_deny_client_access/i);
  });

  it("defines transactional RPC write functions for entry, event, and projection consistency", () => {
    expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION buddhi_create_module_entry\(/i);
    expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION buddhi_update_module_entry\(/i);
    expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION buddhi_soft_delete_module_entry\(/i);
    expect(schemaSql).toMatch(/INSERT INTO module_entries/i);
    expect(schemaSql).toMatch(/INSERT INTO module_entry_events/i);
    expect(schemaSql).toMatch(/INSERT INTO module_entry_projections/i);
  });

  it("includes recommendations doc aligned with implemented architecture", () => {
    expect(recommendationDoc).toContain("World-Class Generic Data Model Recommendations");
    expect(recommendationDoc).toContain("module_entries");
    expect(recommendationDoc).toContain("module_entry_events");
    expect(recommendationDoc).toContain("module_entry_projections");
    expect(recommendationDoc).toContain("RLS");
    expect(recommendationDoc).toContain("Backward Compatibility");
  });
});

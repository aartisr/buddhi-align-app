-- ============================================================
-- Buddhi Align App — Supabase Generic Schema (World-Class Baseline)
-- Run this in your Supabase project's SQL Editor.
--
-- Backward compatibility:
-- - Existing API/provider code that reads/writes module + data still works.
-- - New columns/tables add stronger integrity, tenancy, and analytics support.
-- ============================================================

-- Safe to run repeatedly on Supabase.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- module_entries (canonical generic object table)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_entries (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      TEXT        NOT NULL DEFAULT 'default',
  object_type    TEXT        NOT NULL DEFAULT 'module_entry',
  module         TEXT        NOT NULL,
  owner_subject  TEXT,
  scope          TEXT        NOT NULL DEFAULT 'private',
  status         TEXT        NOT NULL DEFAULT 'active',
  version        BIGINT      NOT NULL DEFAULT 1,
  dedupe_key     TEXT,
  source         TEXT        NOT NULL DEFAULT 'app',
  tags           TEXT[]      NOT NULL DEFAULT '{}',
  data           JSONB       NOT NULL DEFAULT '{}',
  event_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

-- Upgrade path for older deployments that only had {id,module,data,created_at,updated_at}.
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS object_type TEXT NOT NULL DEFAULT 'module_entry';
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS owner_subject TEXT;
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'private';
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS dedupe_key TEXT;
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'app';
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS event_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE module_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_entries_module_nonempty'
  ) THEN
    ALTER TABLE module_entries
      ADD CONSTRAINT module_entries_module_nonempty
      CHECK (btrim(module) <> '');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_entries_scope_valid'
  ) THEN
    ALTER TABLE module_entries
      ADD CONSTRAINT module_entries_scope_valid
      CHECK (scope IN ('private', 'shared', 'public'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_entries_status_valid'
  ) THEN
    ALTER TABLE module_entries
      ADD CONSTRAINT module_entries_status_valid
      CHECK (status IN ('active', 'archived', 'deleted'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_entries_version_positive'
  ) THEN
    ALTER TABLE module_entries
      ADD CONSTRAINT module_entries_version_positive
      CHECK (version >= 1);
  END IF;
END $$;

-- ------------------------------------------------------------
-- Write safety + timestamps
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION _buddhi_update_updated_at_and_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Increment optimistic concurrency version on all updates.
  IF NEW.version IS NULL THEN
    NEW.version = 1;
  ELSIF OLD.version IS NULL THEN
    NEW.version = 1;
  ELSIF NEW.version <= OLD.version THEN
    NEW.version = OLD.version + 1;
  END IF;

  IF NEW.deleted_at IS NOT NULL THEN
    NEW.status = 'deleted';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS module_entries_updated_at ON module_entries;
CREATE TRIGGER module_entries_updated_at
  BEFORE UPDATE ON module_entries
  FOR EACH ROW EXECUTE FUNCTION _buddhi_update_updated_at_and_version();

-- ------------------------------------------------------------
-- Indexing strategy (write/read balanced)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_module_entries_module
  ON module_entries (module);

CREATE INDEX IF NOT EXISTS idx_module_entries_created_at
  ON module_entries (created_at);

CREATE INDEX IF NOT EXISTS idx_module_entries_tenant_module_created
  ON module_entries (tenant_id, module, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_module_entries_tenant_owner_created
  ON module_entries (tenant_id, owner_subject, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_module_entries_status
  ON module_entries (tenant_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_module_entries_data_gin
  ON module_entries USING GIN (data);

CREATE UNIQUE INDEX IF NOT EXISTS idx_module_entries_dedupe_per_tenant
  ON module_entries (tenant_id, module, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- ------------------------------------------------------------
-- module_entry_events (append-only event log)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_entry_events (
  event_id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id        TEXT        NOT NULL,
  module           TEXT        NOT NULL,
  entry_id         UUID        NOT NULL REFERENCES module_entries(id) ON DELETE CASCADE,
  event_type       TEXT        NOT NULL,
  actor_subject    TEXT,
  idempotency_key  TEXT,
  event_payload    JSONB       NOT NULL DEFAULT '{}',
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_module_entry_events_entry_time
  ON module_entry_events (entry_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_entry_events_tenant_module_time
  ON module_entry_events (tenant_id, module, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_entry_events_payload_gin
  ON module_entry_events USING GIN (event_payload);

CREATE UNIQUE INDEX IF NOT EXISTS idx_module_entry_events_idempotency
  ON module_entry_events (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ------------------------------------------------------------
-- module_entry_projections (fast read model / denormalized snapshot)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_entry_projections (
  entry_id             UUID        PRIMARY KEY REFERENCES module_entries(id) ON DELETE CASCADE,
  tenant_id            TEXT        NOT NULL,
  module               TEXT        NOT NULL,
  owner_subject        TEXT,
  current_status       TEXT        NOT NULL,
  projection           JSONB       NOT NULL DEFAULT '{}',
  last_event_id        BIGINT,
  last_event_occurred  TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_module_entry_projections_tenant_module_updated
  ON module_entry_projections (tenant_id, module, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_entry_projections_tenant_owner
  ON module_entry_projections (tenant_id, owner_subject, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_entry_projections_projection_gin
  ON module_entry_projections USING GIN (projection);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_entry_projections_current_status_valid'
  ) THEN
    ALTER TABLE module_entry_projections
      ADD CONSTRAINT module_entry_projections_current_status_valid
      CHECK (current_status IN ('active', 'archived', 'deleted'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION _buddhi_projection_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS module_entry_projections_updated_at ON module_entry_projections;
CREATE TRIGGER module_entry_projections_updated_at
  BEFORE UPDATE ON module_entry_projections
  FOR EACH ROW EXECUTE FUNCTION _buddhi_projection_touch_updated_at();

-- ------------------------------------------------------------
-- Transactional write functions (plug-and-play API write surface)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION buddhi_create_module_entry(
  p_tenant_id TEXT,
  p_module TEXT,
  p_owner_subject TEXT,
  p_scope TEXT,
  p_source TEXT,
  p_dedupe_key TEXT,
  p_tags TEXT[],
  p_data JSONB,
  p_actor_subject TEXT,
  p_event_type TEXT DEFAULT 'created'
)
RETURNS TABLE(id UUID, data JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
  v_entry module_entries%ROWTYPE;
BEGIN
  INSERT INTO module_entries (
    tenant_id,
    object_type,
    module,
    owner_subject,
    scope,
    status,
    version,
    dedupe_key,
    source,
    tags,
    data,
    event_at
  ) VALUES (
    COALESCE(NULLIF(p_tenant_id, ''), 'default'),
    'module_entry',
    p_module,
    NULLIF(p_owner_subject, ''),
    COALESCE(NULLIF(p_scope, ''), 'private'),
    'active',
    1,
    NULLIF(p_dedupe_key, ''),
    COALESCE(NULLIF(p_source, ''), 'app'),
    COALESCE(p_tags, '{}'),
    COALESCE(p_data, '{}'::jsonb),
    NOW()
  )
  RETURNING * INTO v_entry;

  INSERT INTO module_entry_events (
    tenant_id,
    module,
    entry_id,
    event_type,
    actor_subject,
    event_payload,
    occurred_at
  ) VALUES (
    v_entry.tenant_id,
    v_entry.module,
    v_entry.id,
    COALESCE(NULLIF(p_event_type, ''), 'created'),
    NULLIF(p_actor_subject, ''),
    jsonb_build_object(
      'status', v_entry.status,
      'version', v_entry.version,
      'scope', v_entry.scope,
      'source', v_entry.source
    ),
    NOW()
  );

  INSERT INTO module_entry_projections (
    entry_id,
    tenant_id,
    module,
    owner_subject,
    current_status,
    projection,
    last_event_id,
    last_event_occurred
  ) VALUES (
    v_entry.id,
    v_entry.tenant_id,
    v_entry.module,
    v_entry.owner_subject,
    v_entry.status,
    v_entry.data,
    currval(pg_get_serial_sequence('module_entry_events', 'event_id')),
    NOW()
  )
  ON CONFLICT (entry_id)
  DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    module = EXCLUDED.module,
    owner_subject = EXCLUDED.owner_subject,
    current_status = EXCLUDED.current_status,
    projection = EXCLUDED.projection,
    last_event_id = EXCLUDED.last_event_id,
    last_event_occurred = EXCLUDED.last_event_occurred,
    updated_at = NOW();

  RETURN QUERY SELECT v_entry.id, v_entry.data;
END;
$$;

CREATE OR REPLACE FUNCTION buddhi_update_module_entry(
  p_tenant_id TEXT,
  p_module TEXT,
  p_entry_id UUID,
  p_data JSONB,
  p_actor_subject TEXT,
  p_event_type TEXT DEFAULT 'updated'
)
RETURNS TABLE(id UUID, data JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
  v_entry module_entries%ROWTYPE;
BEGIN
  UPDATE module_entries
  SET
    data = COALESCE(p_data, '{}'::jsonb),
    event_at = NOW(),
    deleted_at = NULL,
    status = 'active'
  WHERE id = p_entry_id
    AND module = p_module
    AND tenant_id = COALESCE(NULLIF(p_tenant_id, ''), 'default')
  RETURNING * INTO v_entry;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not found';
  END IF;

  INSERT INTO module_entry_events (
    tenant_id,
    module,
    entry_id,
    event_type,
    actor_subject,
    event_payload,
    occurred_at
  ) VALUES (
    v_entry.tenant_id,
    v_entry.module,
    v_entry.id,
    COALESCE(NULLIF(p_event_type, ''), 'updated'),
    NULLIF(p_actor_subject, ''),
    jsonb_build_object(
      'status', v_entry.status,
      'version', v_entry.version,
      'scope', v_entry.scope,
      'source', v_entry.source
    ),
    NOW()
  );

  INSERT INTO module_entry_projections (
    entry_id,
    tenant_id,
    module,
    owner_subject,
    current_status,
    projection,
    last_event_id,
    last_event_occurred
  ) VALUES (
    v_entry.id,
    v_entry.tenant_id,
    v_entry.module,
    v_entry.owner_subject,
    v_entry.status,
    v_entry.data,
    currval(pg_get_serial_sequence('module_entry_events', 'event_id')),
    NOW()
  )
  ON CONFLICT (entry_id)
  DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    module = EXCLUDED.module,
    owner_subject = EXCLUDED.owner_subject,
    current_status = EXCLUDED.current_status,
    projection = EXCLUDED.projection,
    last_event_id = EXCLUDED.last_event_id,
    last_event_occurred = EXCLUDED.last_event_occurred,
    updated_at = NOW();

  RETURN QUERY SELECT v_entry.id, v_entry.data;
END;
$$;

CREATE OR REPLACE FUNCTION buddhi_soft_delete_module_entry(
  p_tenant_id TEXT,
  p_module TEXT,
  p_entry_id UUID,
  p_actor_subject TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_entry module_entries%ROWTYPE;
BEGIN
  UPDATE module_entries
  SET
    deleted_at = NOW(),
    status = 'deleted',
    event_at = NOW()
  WHERE id = p_entry_id
    AND module = p_module
    AND tenant_id = COALESCE(NULLIF(p_tenant_id, ''), 'default')
    AND deleted_at IS NULL
  RETURNING * INTO v_entry;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO module_entry_events (
    tenant_id,
    module,
    entry_id,
    event_type,
    actor_subject,
    event_payload,
    occurred_at
  ) VALUES (
    v_entry.tenant_id,
    v_entry.module,
    v_entry.id,
    'deleted',
    NULLIF(p_actor_subject, ''),
    jsonb_build_object(
      'status', v_entry.status,
      'version', v_entry.version,
      'scope', v_entry.scope,
      'source', v_entry.source
    ),
    NOW()
  );

  INSERT INTO module_entry_projections (
    entry_id,
    tenant_id,
    module,
    owner_subject,
    current_status,
    projection,
    last_event_id,
    last_event_occurred
  ) VALUES (
    v_entry.id,
    v_entry.tenant_id,
    v_entry.module,
    v_entry.owner_subject,
    v_entry.status,
    v_entry.data,
    currval(pg_get_serial_sequence('module_entry_events', 'event_id')),
    NOW()
  )
  ON CONFLICT (entry_id)
  DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    module = EXCLUDED.module,
    owner_subject = EXCLUDED.owner_subject,
    current_status = EXCLUDED.current_status,
    projection = EXCLUDED.projection,
    last_event_id = EXCLUDED.last_event_id,
    last_event_occurred = EXCLUDED.last_event_occurred,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Optional helper view for active records only.
CREATE OR REPLACE VIEW module_entries_active AS
SELECT *
FROM module_entries
WHERE deleted_at IS NULL;

-- ------------------------------------------------------------
-- Optional tenant-aware RLS blueprint
-- ------------------------------------------------------------
-- Supabase puts JWT claims under request.jwt.claims. These helpers make
-- policy definitions concise and centralized.
CREATE OR REPLACE FUNCTION buddhi_current_tenant()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'tenant_id', 'default');
$$;

CREATE OR REPLACE FUNCTION buddhi_current_subject()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub';
$$;

-- RLS stays disabled by default for compatibility with service-role API routes.
-- Enable and tune only if you query tables with anon/authenticated keys.
--
-- ALTER TABLE module_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE module_entry_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE module_entry_projections ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS module_entries_tenant_select ON module_entries;
-- CREATE POLICY module_entries_tenant_select
--   ON module_entries
--   FOR SELECT
--   USING (tenant_id = buddhi_current_tenant() AND deleted_at IS NULL);
--
-- DROP POLICY IF EXISTS module_entries_tenant_modify ON module_entries;
-- CREATE POLICY module_entries_tenant_modify
--   ON module_entries
--   FOR ALL
--   USING (tenant_id = buddhi_current_tenant())
--   WITH CHECK (
--     tenant_id = buddhi_current_tenant()
--     AND (
--       owner_subject IS NULL
--       OR owner_subject = buddhi_current_subject()
--       OR scope IN ('shared', 'public')
--     )
--   );

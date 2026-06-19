-- =============================================================================
-- Ticket Analyzer — Production PostgreSQL Schema
-- =============================================================================
-- PostgreSQL 16+
-- Single-table design: AI analysis fields live on the ticket row.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ENUM TYPES (domain constraints)
-- -----------------------------------------------------------------------------

CREATE TYPE ticket_category AS ENUM (
    'Billing',
    'Technical',
    'Account',
    'Feature Request',
    'Other'
);

CREATE TYPE ticket_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- -----------------------------------------------------------------------------
-- 2. CORE TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE tickets (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(200)    NOT NULL,
    description   TEXT            NOT NULL,
    category      ticket_category,
    priority      ticket_priority,
    summary       TEXT,
    ai_confidence NUMERIC(5, 4)   CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT tickets_title_not_blank
        CHECK (char_length(trim(title)) >= 3),
    CONSTRAINT tickets_description_not_blank
        CHECK (char_length(trim(description)) >= 10),
    CONSTRAINT tickets_analysis_consistency
        CHECK (
            (category IS NULL AND priority IS NULL AND summary IS NULL AND ai_confidence IS NULL)
            OR
            (category IS NOT NULL AND priority IS NOT NULL AND summary IS NOT NULL AND ai_confidence IS NOT NULL)
        )
);

COMMENT ON TABLE  tickets IS 'Support tickets with inline AI classification results';
COMMENT ON COLUMN tickets.category      IS 'AI-assigned category; NULL until analyzed';
COMMENT ON COLUMN tickets.priority      IS 'AI-assigned priority; NULL until analyzed';
COMMENT ON COLUMN tickets.summary       IS 'AI-generated short summary';
COMMENT ON COLUMN tickets.ai_confidence IS 'Blended model confidence score (0.0000–1.0000)';

-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------

-- Dashboard filters
CREATE INDEX idx_tickets_category       ON tickets (category);
CREATE INDEX idx_tickets_priority       ON tickets (priority);

-- Recent-first listing (dashboard, pagination)
CREATE INDEX idx_tickets_created_at_desc ON tickets (created_at DESC);

-- Partial index: pending (unanalyzed) tickets only
CREATE INDEX idx_tickets_pending        ON tickets (created_at DESC)
    WHERE category IS NULL;

-- Partial index: analyzed tickets for reporting
CREATE INDEX idx_tickets_analyzed       ON tickets (updated_at DESC)
    WHERE category IS NOT NULL;

-- Full-text search on title + description
CREATE INDEX idx_tickets_fts            ON tickets
    USING gin (to_tsvector('english', title || ' ' || description));

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tickets_set_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. RELATIONSHIPS
-- -----------------------------------------------------------------------------
-- Intentionally denormalized single-table model.
-- No foreign keys — each ticket is self-contained.
--
-- Optional future extension (not in MVP):
--
--   CREATE TABLE ticket_audit_log (
--       id         BIGSERIAL PRIMARY KEY,
--       ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
--       event      VARCHAR(50) NOT NULL,
--       payload    JSONB,
--       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
--   );
--
--   CREATE INDEX idx_audit_ticket_id ON ticket_audit_log (ticket_id);

-- -----------------------------------------------------------------------------
-- 6. BEST PRACTICES APPLIED
-- -----------------------------------------------------------------------------
-- • UUID primary keys          — safe for distributed APIs, no sequential leaks
-- • TIMESTAMPTZ                — timezone-aware timestamps
-- • PostgreSQL ENUMs           — enforce valid category/priority at DB level
-- • CHECK constraints          — input length + analysis field consistency
-- • Partial indexes            — smaller, faster queries for pending/analyzed views
-- • GIN full-text index        — scalable search without ILIKE table scans
-- • updated_at trigger         — automatic row versioning on every UPDATE
-- • NUMERIC(5,4) for confidence — exact decimal storage (no float drift)
-- • Nullable AI fields         — ticket exists before analysis completes
-- • Table/column comments      — self-documenting schema for ops teams

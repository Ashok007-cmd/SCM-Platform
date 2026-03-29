-- ============================================================
-- SCM Platform — V2 Users & Authentication
-- Flyway Migration: V2__users.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'VIEWER',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add requested_by / approved_by FK to purchase_orders now that users table exists
ALTER TABLE purchase_orders
    ADD COLUMN requested_by UUID REFERENCES users(id),
    ADD COLUMN approved_by  UUID REFERENCES users(id);

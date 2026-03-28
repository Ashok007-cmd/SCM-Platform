-- ============================================================
-- SCM Platform — Auth Schema Performance Indexes
-- Migration: V2__add_performance_indexes.sql
-- ============================================================

-- Index on users.email for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email
    ON auth.users (email);

-- Index on refresh_tokens.token for fast token validation
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token
    ON auth.refresh_tokens (token);

-- Index on refresh_tokens.user_id for fast revocation by user
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON auth.refresh_tokens (user_id);

-- Index on user_roles.user_id for fast role lookups per user
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
    ON auth.user_roles (user_id);

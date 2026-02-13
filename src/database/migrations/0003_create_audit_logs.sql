-- 0003_create_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  user_id TEXT,
  target_id TEXT,
  ip TEXT,
  user_agent TEXT,
  data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

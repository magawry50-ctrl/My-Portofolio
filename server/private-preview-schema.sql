CREATE TABLE IF NOT EXISTS preview_attempts (
  scope TEXT NOT NULL,
  window_id INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  PRIMARY KEY (scope, window_id)
);
CREATE TABLE IF NOT EXISTS preview_sessions (
  token_hash TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  credential_version TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS preview_sessions_expiry ON preview_sessions(expires_at);

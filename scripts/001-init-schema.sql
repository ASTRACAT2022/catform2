-- CAT FORM Database Schema
-- Version: 1.0.0

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  settings TEXT NOT NULL DEFAULT '{}', -- JSON: theme, captcha, limits, etc.
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  view_count INTEGER NOT NULL DEFAULT 0,
  response_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Form fields table
CREATE TABLE IF NOT EXISTS form_fields (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  type TEXT NOT NULL, -- text, email, number, select, checkbox, radio, file, date, slider, matrix, rating, geolocation
  label TEXT NOT NULL,
  description TEXT,
  placeholder TEXT,
  options TEXT, -- JSON array for select/radio/checkbox
  validation TEXT, -- JSON: required, min, max, pattern, etc.
  position INTEGER NOT NULL,
  settings TEXT NOT NULL DEFAULT '{}', -- JSON: conditional logic, etc.
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_position ON form_fields(form_id, position);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  user_fingerprint TEXT, -- Browser fingerprint for duplicate detection
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  referrer TEXT,
  completed BOOLEAN NOT NULL DEFAULT 0,
  completion_time INTEGER, -- Time in seconds
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_fingerprint ON responses(form_id, user_fingerprint);

-- Response answers table
CREATE TABLE IF NOT EXISTS response_answers (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  field_id TEXT NOT NULL,
  value TEXT NOT NULL, -- JSON for complex values
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_response_answers_response_id ON response_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_response_answers_field_id ON response_answers(field_id);

-- Analytics events table (for real-time tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  response_id TEXT,
  event_type TEXT NOT NULL, -- view, start, field_complete, abandon, submit
  field_id TEXT,
  metadata TEXT, -- JSON: additional data
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_form_id ON analytics_events(form_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT NOT NULL, -- JSON array: ['response.created', 'response.completed']
  active BOOLEAN NOT NULL DEFAULT 1,
  secret TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhooks_form_id ON webhooks(form_id);

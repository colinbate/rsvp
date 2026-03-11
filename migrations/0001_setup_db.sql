-- Migration number: 0001 	 2026-03-10T23:19:56.771Z

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  canonical_url TEXT,
  location TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  waitlist_enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'open', 'closed', 'cancelled', 'completed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  person_id INTEGER NOT NULL REFERENCES people(id),
  name_snapshot TEXT NOT NULL,
  email_snapshot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK(status IN ('registered', 'waitlisted', 'cancelled', 'attended', 'no_show')),
  confirmation_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now')),
  admin_note TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_person_unique ON registrations(event_id, person_id);
CREATE INDEX IF NOT EXISTS registrations_event_id_idx ON registrations(event_id);
CREATE INDEX IF NOT EXISTS registrations_person_id_idx ON registrations(person_id);
CREATE INDEX IF NOT EXISTS registrations_confirmation_token_idx ON registrations(confirmation_token);
CREATE INDEX IF NOT EXISTS events_slug_idx ON events(slug);
CREATE INDEX IF NOT EXISTS people_email_normalized_idx ON people(email_normalized);

-- Migration number: 0003

ALTER TABLE people ADD COLUMN member_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS people_member_id_unique ON people(member_id) WHERE member_id IS NOT NULL;

PRAGMA foreign_keys=off;

CREATE TABLE registrations_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  person_id INTEGER NOT NULL REFERENCES people(id),
  name_snapshot TEXT NOT NULL,
  email_snapshot TEXT NOT NULL,
  member_id_snapshot TEXT,
  status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'waitlisted', 'cancelled', 'attended', 'no_show', 'declined'
  confirmation_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%FT%H:%M:%fZ', 'now')),
  admin_note TEXT
);

INSERT INTO registrations_new (
  id,
  event_id,
  person_id,
  name_snapshot,
  email_snapshot,
  status,
  confirmation_token,
  created_at,
  updated_at,
  admin_note
)
SELECT
  id,
  event_id,
  person_id,
  name_snapshot,
  email_snapshot,
  status,
  confirmation_token,
  created_at,
  updated_at,
  admin_note
FROM registrations;

DROP TABLE registrations;
ALTER TABLE registrations_new RENAME TO registrations;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_person_unique ON registrations(event_id, person_id);
CREATE INDEX IF NOT EXISTS registrations_event_id_idx ON registrations(event_id);
CREATE INDEX IF NOT EXISTS registrations_person_id_idx ON registrations(person_id);
CREATE INDEX IF NOT EXISTS registrations_confirmation_token_idx ON registrations(confirmation_token);

PRAGMA foreign_keys=on;

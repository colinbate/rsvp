-- Migration number: 0002 	 Add timezone column to events

ALTER TABLE events ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Atlantic/Bermuda';

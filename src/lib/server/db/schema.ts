import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const events = sqliteTable('events', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	canonicalUrl: text('canonical_url'),
	location: text('location'),
	startsAt: text('starts_at').notNull(),
	endsAt: text('ends_at'),
	timezone: text('timezone').notNull().default('Atlantic/Bermuda'),
	capacity: integer('capacity').notNull().default(20),
	waitlistEnabled: integer('waitlist_enabled', { mode: 'boolean' }).notNull().default(true),
	status: text('status', { enum: ['draft', 'open', 'closed', 'cancelled', 'completed'] })
		.notNull()
		.default('draft'),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(strftime('%FT%H:%M:%fZ', 'now'))`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(strftime('%FT%H:%M:%fZ', 'now'))`)
});

export const people = sqliteTable('people', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailNormalized: text('email_normalized').notNull().unique(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(strftime('%FT%H:%M:%fZ', 'now'))`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(strftime('%FT%H:%M:%fZ', 'now'))`)
});

export const registrations = sqliteTable('registrations', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	eventId: integer('event_id')
		.notNull()
		.references(() => events.id),
	personId: integer('person_id')
		.notNull()
		.references(() => people.id),
	nameSnapshot: text('name_snapshot').notNull(),
	emailSnapshot: text('email_snapshot').notNull(),
	status: text('status', {
		enum: ['registered', 'waitlisted', 'cancelled', 'attended', 'no_show']
	})
		.notNull()
		.default('registered'),
	confirmationToken: text('confirmation_token').notNull().unique(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(strftime('%FT%H:%M:%fZ', 'now'))`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(strftime('%FT%H:%M:%fZ', 'now'))`),
	adminNote: text('admin_note')
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

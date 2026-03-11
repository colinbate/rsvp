import { eq, and, asc, sql } from 'drizzle-orm';
import { registrations, people, events } from '$lib/server/db/schema';
import type { ORM } from '$lib/server/db';
import { generateToken } from '$lib/server/utils';

export async function getRegistrationsByEvent(db: ORM, eventId: number) {
	const rows = await db
		.select({
			registration: registrations,
			person: people
		})
		.from(registrations)
		.innerJoin(people, eq(registrations.personId, people.id))
		.where(eq(registrations.eventId, eventId))
		.orderBy(asc(registrations.createdAt));

	return rows;
}

export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show';

export async function getRegistrationsByEventAndStatus(
	db: ORM,
	eventId: number,
	status: RegistrationStatus
) {
	const rows = await db
		.select({
			registration: registrations,
			person: people
		})
		.from(registrations)
		.innerJoin(people, eq(registrations.personId, people.id))
		.where(and(eq(registrations.eventId, eventId), eq(registrations.status, status)))
		.orderBy(asc(registrations.createdAt));

	return rows;
}

export async function getRegistrationById(db: ORM, id: number) {
	const rows = await db
		.select({
			registration: registrations,
			person: people
		})
		.from(registrations)
		.innerJoin(people, eq(registrations.personId, people.id))
		.where(eq(registrations.id, id))
		.limit(1);

	return rows[0] ?? null;
}

export async function getRegistrationByToken(db: ORM, token: string) {
	const rows = await db
		.select({
			registration: registrations,
			person: people,
			event: events
		})
		.from(registrations)
		.innerJoin(people, eq(registrations.personId, people.id))
		.innerJoin(events, eq(registrations.eventId, events.id))
		.where(eq(registrations.confirmationToken, token))
		.limit(1);

	return rows[0] ?? null;
}

export async function getRegistrationWithEvent(db: ORM, id: number) {
	const rows = await db
		.select({
			registration: registrations,
			person: people,
			event: events
		})
		.from(registrations)
		.innerJoin(people, eq(registrations.personId, people.id))
		.innerJoin(events, eq(registrations.eventId, events.id))
		.where(eq(registrations.id, id))
		.limit(1);

	return rows[0] ?? null;
}

export async function findExistingRegistration(db: ORM, eventId: number, personId: number) {
	const rows = await db
		.select()
		.from(registrations)
		.where(and(eq(registrations.eventId, eventId), eq(registrations.personId, personId)))
		.limit(1);

	return rows[0] ?? null;
}

export async function getRegisteredCount(db: ORM, eventId: number): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)`.as('count') })
		.from(registrations)
		.where(and(eq(registrations.eventId, eventId), eq(registrations.status, 'registered')));

	return result[0]?.count ?? 0;
}

export async function createRegistration(
	db: ORM,
	data: {
		eventId: number;
		personId: number;
		nameSnapshot: string;
		emailSnapshot: string;
		status: 'registered' | 'waitlisted';
		adminNote?: string;
	}
) {
	const token = generateToken();
	const result = await db
		.insert(registrations)
		.values({
			eventId: data.eventId,
			personId: data.personId,
			nameSnapshot: data.nameSnapshot,
			emailSnapshot: data.emailSnapshot,
			status: data.status,
			confirmationToken: token,
			adminNote: data.adminNote ?? null
		})
		.returning();

	return result[0];
}

export async function updateRegistrationStatus(
	db: ORM,
	id: number,
	status: RegistrationStatus,
	adminNote?: string
) {
	const updates: Record<string, unknown> = {
		status,
		updatedAt: new Date().toISOString()
	};
	if (adminNote !== undefined) {
		updates.adminNote = adminNote;
	}

	const result = await db
		.update(registrations)
		.set(updates)
		.where(eq(registrations.id, id))
		.returning();

	return result[0] ?? null;
}

/**
 * Cancel a registration and optionally promote the next waitlisted person.
 * Returns the promoted registration (with event and person) if one was promoted, or null.
 */
export async function cancelRegistration(db: ORM, id: number) {
	const reg = await getRegistrationWithEvent(db, id);
	if (!reg) return { cancelled: null, promoted: null };

	// Cancel the registration
	const cancelled = await updateRegistrationStatus(db, id, 'cancelled');

	// If the cancelled registration was "registered" and waitlist is enabled,
	// promote the next waitlisted person
	let promoted = null;
	if (reg.registration.status === 'registered' && reg.event.waitlistEnabled) {
		promoted = await promoteNextWaitlisted(db, reg.event.id);
	}

	return { cancelled, promoted };
}

/**
 * Promote the next waitlisted person (oldest first) to registered.
 * Returns the promoted registration with event and person data, or null if none.
 */
export async function promoteNextWaitlisted(db: ORM, eventId: number) {
	const waitlisted = await db
		.select()
		.from(registrations)
		.where(and(eq(registrations.eventId, eventId), eq(registrations.status, 'waitlisted')))
		.orderBy(asc(registrations.createdAt))
		.limit(1);

	if (waitlisted.length === 0) return null;

	await updateRegistrationStatus(db, waitlisted[0].id, 'registered');

	// Return full data for email sending
	return getRegistrationWithEvent(db, waitlisted[0].id);
}

/**
 * Promote a specific waitlisted registration to registered.
 */
export async function promoteRegistration(db: ORM, id: number) {
	const reg = await getRegistrationWithEvent(db, id);
	if (!reg || reg.registration.status !== 'waitlisted') return null;

	await updateRegistrationStatus(db, id, 'registered');
	return getRegistrationWithEvent(db, id);
}

/**
 * Regenerate a confirmation token for a registration (for resending emails).
 */
export async function regenerateToken(db: ORM, id: number) {
	const token = generateToken();
	const result = await db
		.update(registrations)
		.set({ confirmationToken: token, updatedAt: new Date().toISOString() })
		.where(eq(registrations.id, id))
		.returning();

	return result[0] ?? null;
}

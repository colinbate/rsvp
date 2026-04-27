import { eq } from 'drizzle-orm';
import { people } from '$lib/server/db/schema';
import type { ORM } from '$lib/server/db';
import { normalizeEmail } from '$lib/server/utils';

export class MemberIdConflictError extends Error {
	constructor() {
		super('Member ID is already linked to another person.');
		this.name = 'MemberIdConflictError';
	}
}

function normalizeMemberId(memberId?: string | null) {
	const trimmed = memberId?.trim();
	return trimmed ? trimmed : null;
}

export async function findPersonByEmail(db: ORM, email: string) {
	const normalized = normalizeEmail(email);
	const result = await db
		.select()
		.from(people)
		.where(eq(people.emailNormalized, normalized))
		.limit(1);
	return result[0] ?? null;
}

export async function findPersonByMemberId(db: ORM, memberId: string) {
	const normalized = normalizeMemberId(memberId);
	if (!normalized) return null;

	const result = await db.select().from(people).where(eq(people.memberId, normalized)).limit(1);
	return result[0] ?? null;
}

export async function findOrCreatePerson(
	db: ORM,
	name: string,
	email: string,
	memberId?: string | null
) {
	const normalized = normalizeEmail(email);
	const normalizedMemberId = normalizeMemberId(memberId);
	const existing = await findPersonByEmail(db, email);
	const memberOwner = normalizedMemberId
		? await findPersonByMemberId(db, normalizedMemberId)
		: null;

	if (memberOwner && (!existing || memberOwner.id !== existing.id)) {
		throw new MemberIdConflictError();
	}

	if (existing) {
		const updates: Partial<typeof people.$inferInsert> = {};
		if (existing.name !== name) {
			updates.name = name;
		}
		if (normalizedMemberId && existing.memberId !== normalizedMemberId) {
			updates.memberId = normalizedMemberId;
		}
		if (Object.keys(updates).length > 0) {
			const updated = await db
				.update(people)
				.set({ ...updates, updatedAt: new Date().toISOString() })
				.where(eq(people.id, existing.id))
				.returning();
			return updated[0];
		}
		return existing;
	}

	const result = await db
		.insert(people)
		.values({
			name,
			email,
			emailNormalized: normalized,
			memberId: normalizedMemberId
		})
		.returning();
	return result[0];
}

export async function getPersonById(db: ORM, id: number) {
	const result = await db.select().from(people).where(eq(people.id, id)).limit(1);
	return result[0] ?? null;
}

/**
 * Create a person record with only a name (no real email).
 * Uses a unique placeholder email based on crypto random to satisfy the unique constraint.
 */
export async function createAnonymousPerson(db: ORM, name: string, memberId?: string | null) {
	const bytes = crypto.getRandomValues(new Uint8Array(8));
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	const placeholder = `anonymous-${hex}@placeholder.invalid`;

	const result = await db
		.insert(people)
		.values({
			name,
			email: '',
			emailNormalized: placeholder,
			memberId: normalizeMemberId(memberId)
		})
		.returning();
	return result[0];
}

/**
 * Find or create a person given a name and an optional email.
 * If an email is provided, delegates to `findOrCreatePerson`.
 * If no email is provided, creates an anonymous person record.
 */
export async function findOrCreatePersonByNameAndOptionalEmail(
	db: ORM,
	name: string,
	email?: string,
	memberId?: string | null
) {
	if (email && email.trim() !== '') {
		return findOrCreatePerson(db, name, email, memberId);
	}
	if (memberId && memberId.trim() !== '') {
		const existing = await findPersonByMemberId(db, memberId);
		if (existing) {
			if (existing.name !== name) {
				const updated = await db
					.update(people)
					.set({ name, updatedAt: new Date().toISOString() })
					.where(eq(people.id, existing.id))
					.returning();
				return updated[0];
			}
			return existing;
		}
	}
	return createAnonymousPerson(db, name, memberId);
}

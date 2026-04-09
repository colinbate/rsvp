import { eq } from 'drizzle-orm';
import { people } from '$lib/server/db/schema';
import type { ORM } from '$lib/server/db';
import { normalizeEmail } from '$lib/server/utils';

export async function findPersonByEmail(db: ORM, email: string) {
	const normalized = normalizeEmail(email);
	const result = await db
		.select()
		.from(people)
		.where(eq(people.emailNormalized, normalized))
		.limit(1);
	return result[0] ?? null;
}

export async function findOrCreatePerson(db: ORM, name: string, email: string) {
	const normalized = normalizeEmail(email);
	const existing = await findPersonByEmail(db, email);

	if (existing) {
		// Update name if it has changed
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

	const result = await db
		.insert(people)
		.values({
			name,
			email,
			emailNormalized: normalized
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
export async function createAnonymousPerson(db: ORM, name: string) {
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
			emailNormalized: placeholder
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
	email?: string
) {
	if (email && email.trim() !== '') {
		return findOrCreatePerson(db, name, email);
	}
	return createAnonymousPerson(db, name);
}

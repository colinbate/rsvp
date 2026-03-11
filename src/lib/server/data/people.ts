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

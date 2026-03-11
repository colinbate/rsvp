import { eq, sql, desc, asc } from 'drizzle-orm';
import { events, registrations } from '$lib/server/db/schema';
import type { ORM } from '$lib/server/db';
import type { NewEvent } from '$lib/server/db/schema';

export async function getEventBySlug(db: ORM, slug: string) {
	const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
	return result[0] ?? null;
}

export async function getEventById(db: ORM, id: number) {
	const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
	return result[0] ?? null;
}

export async function listEvents(db: ORM) {
	const rows = await db.select().from(events).orderBy(desc(events.startsAt));
	return rows;
}

export async function listUpcomingEvents(db: ORM) {
	const now = new Date().toISOString();
	const rows = await db
		.select()
		.from(events)
		.where(sql`${events.startsAt} >= ${now}`)
		.orderBy(asc(events.startsAt));
	return rows;
}

export async function createEvent(db: ORM, data: NewEvent) {
	const result = await db.insert(events).values(data).returning();
	return result[0];
}

export async function updateEvent(
	db: ORM,
	id: number,
	data: Partial<Omit<NewEvent, 'id' | 'createdAt'>>
) {
	const result = await db
		.update(events)
		.set({ ...data, updatedAt: new Date().toISOString() })
		.where(eq(events.id, id))
		.returning();
	return result[0] ?? null;
}

export async function getEventWithCounts(db: ORM, id: number) {
	const event = await getEventById(db, id);
	if (!event) return null;

	const counts = await db
		.select({
			status: registrations.status,
			count: sql<number>`count(*)`.as('count')
		})
		.from(registrations)
		.where(eq(registrations.eventId, id))
		.groupBy(registrations.status);

	const statusCounts: Record<string, number> = {};
	for (const row of counts) {
		statusCounts[row.status] = row.count;
	}

	return {
		...event,
		registeredCount: statusCounts['registered'] ?? 0,
		waitlistedCount: statusCounts['waitlisted'] ?? 0,
		cancelledCount: statusCounts['cancelled'] ?? 0,
		attendedCount: statusCounts['attended'] ?? 0,
		noShowCount: statusCounts['no_show'] ?? 0
	};
}

export async function listEventsWithCounts(db: ORM) {
	const allEvents = await listEvents(db);

	const counts = await db
		.select({
			eventId: registrations.eventId,
			status: registrations.status,
			count: sql<number>`count(*)`.as('count')
		})
		.from(registrations)
		.groupBy(registrations.eventId, registrations.status);

	const countMap = new Map<number, Record<string, number>>();
	for (const row of counts) {
		if (!countMap.has(row.eventId)) {
			countMap.set(row.eventId, {});
		}
		countMap.get(row.eventId)![row.status] = row.count;
	}

	return allEvents.map((event) => {
		const statusCounts = countMap.get(event.id) ?? {};
		return {
			...event,
			registeredCount: statusCounts['registered'] ?? 0,
			waitlistedCount: statusCounts['waitlisted'] ?? 0,
			cancelledCount: statusCounts['cancelled'] ?? 0,
			attendedCount: statusCounts['attended'] ?? 0,
			noShowCount: statusCounts['no_show'] ?? 0
		};
	});
}

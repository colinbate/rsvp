import type { PageServerLoad } from './$types';
import { listEventsWithCounts } from '$lib/server/data/events';

export const load: PageServerLoad = async ({ locals }) => {
	const events = await listEventsWithCounts(locals.db);

	const now = new Date().toISOString();
	const upcoming = events.filter((e) => e.startsAt >= now && e.status !== 'cancelled');
	const past = events.filter((e) => e.startsAt < now || e.status === 'cancelled');

	return { upcoming, past };
};

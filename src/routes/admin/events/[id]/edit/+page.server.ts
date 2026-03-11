import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEventById, updateEvent } from '$lib/server/data/events';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		return error(400, 'Invalid event ID.');
	}

	const event = await getEventById(locals.db, id);
	if (!event) {
		return error(404, 'Event not found.');
	}

	return { event };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const id = parseInt(params.id, 10);
		if (isNaN(id)) {
			return fail(400, { error: 'Invalid event ID.' });
		}

		const existing = await getEventById(locals.db, id);
		if (!existing) {
			return error(404, 'Event not found.');
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim() ?? '';
		const slug = formData.get('slug')?.toString().trim() ?? '';
		const canonicalUrl = formData.get('canonical_url')?.toString().trim() || null;
		const location = formData.get('location')?.toString().trim() || null;
		const startsAt = formData.get('starts_at')?.toString().trim() ?? '';
		const endsAt = formData.get('ends_at')?.toString().trim() || null;
		const capacity = parseInt(formData.get('capacity')?.toString() ?? '20', 10);
		const waitlistEnabled = formData.has('waitlist_enabled');
		const status = formData.get('status')?.toString().trim() ?? 'draft';

		const formValues = {
			title,
			slug,
			canonicalUrl,
			location,
			startsAt,
			endsAt,
			capacity,
			waitlistEnabled,
			status
		};

		if (!title) {
			return fail(400, { error: 'Title is required.', ...formValues });
		}

		if (!slug) {
			return fail(400, { error: 'Slug is required.', ...formValues });
		}

		if (!startsAt) {
			return fail(400, { error: 'Start date/time is required.', ...formValues });
		}

		if (isNaN(capacity) || capacity < 1) {
			return fail(400, { error: 'Capacity must be at least 1.', ...formValues });
		}

		try {
			await updateEvent(locals.db, id, {
				title,
				slug,
				canonicalUrl,
				location,
				startsAt: new Date(startsAt).toISOString(),
				endsAt: endsAt ? new Date(endsAt).toISOString() : null,
				capacity,
				waitlistEnabled,
				status: status as 'draft' | 'open' | 'closed' | 'cancelled' | 'completed'
			});
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			if (message.includes('UNIQUE constraint failed') && message.includes('slug')) {
				return fail(400, { error: 'An event with this slug already exists.', ...formValues });
			}
			return fail(500, { error: `Failed to update event: ${message}`, ...formValues });
		}
		return redirect(303, `/admin/events/${id}`);
	}
} satisfies Actions;

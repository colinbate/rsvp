import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createEvent } from '$lib/server/data/events';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions = {
	default: async ({ request, locals }) => {
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

		if (!title) {
			return fail(400, {
				error: 'Title is required.',
				title,
				slug,
				canonicalUrl,
				location,
				startsAt,
				endsAt,
				capacity,
				waitlistEnabled,
				status
			});
		}

		if (!slug) {
			return fail(400, {
				error: 'Slug is required.',
				title,
				slug,
				canonicalUrl,
				location,
				startsAt,
				endsAt,
				capacity,
				waitlistEnabled,
				status
			});
		}

		if (!startsAt) {
			return fail(400, {
				error: 'Start date/time is required.',
				title,
				slug,
				canonicalUrl,
				location,
				startsAt,
				endsAt,
				capacity,
				waitlistEnabled,
				status
			});
		}

		if (isNaN(capacity) || capacity < 1) {
			return fail(400, {
				error: 'Capacity must be at least 1.',
				title,
				slug,
				canonicalUrl,
				location,
				startsAt,
				endsAt,
				capacity,
				waitlistEnabled,
				status
			});
		}
		let eventId: number | undefined;
		try {
			const event = await createEvent(locals.db, {
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
			eventId = event.id;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			if (message.includes('UNIQUE constraint failed') && message.includes('slug')) {
				return fail(400, {
					error: 'An event with this slug already exists.',
					title,
					slug,
					canonicalUrl,
					location,
					startsAt,
					endsAt,
					capacity,
					waitlistEnabled,
					status
				});
			}
			return fail(500, {
				error: `Failed to create event: ${message}`,
				title,
				slug,
				canonicalUrl,
				location,
				startsAt,
				endsAt,
				capacity,
				waitlistEnabled,
				status
			});
		}
		return redirect(303, `/admin/events/${eventId}`);
	}
} satisfies Actions;

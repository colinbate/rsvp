import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getRegistrationByToken, cancelRegistration } from '$lib/server/data/registrations';
import {
	getEmailConfig,
	sendCancellationConfirmation,
	sendWaitlistPromotion
} from '$lib/server/email';

export const load: PageServerLoad = async ({ params, locals }) => {
	const result = await getRegistrationByToken(locals.db, params.token);

	if (!result) {
		return error(404, 'Registration not found. This link may have expired or already been used.');
	}

	const { registration, event } = result;

	const alreadyCancelled = registration.status === 'cancelled';

	return {
		event: {
			title: event.title,
			slug: event.slug,
			canonicalUrl: event.canonicalUrl,
			location: event.location,
			startsAt: event.startsAt,
			endsAt: event.endsAt
		},
		registration: {
			id: registration.id,
			status: registration.status,
			nameSnapshot: registration.nameSnapshot
		},
		alreadyCancelled,
		token: params.token
	};
};

export const actions = {
	default: async ({ params, locals, platform }) => {
		const result = await getRegistrationByToken(locals.db, params.token);

		if (!result) {
			return error(404, 'Registration not found.');
		}

		const { registration, event } = result;

		if (registration.status === 'cancelled') {
			return { success: true, alreadyCancelled: true };
		}

		if (registration.status !== 'registered' && registration.status !== 'waitlisted') {
			return error(400, 'This registration cannot be cancelled.');
		}

		const { promoted } = await cancelRegistration(locals.db, registration.id);

		// Send cancellation confirmation email
		const emailConfig = getEmailConfig(platform);
		if (emailConfig) {
			await sendCancellationConfirmation(
				emailConfig,
				event,
				registration.emailSnapshot,
				registration.nameSnapshot
			);

			// If someone was promoted from the waitlist, send them a notification
			if (promoted) {
				await sendWaitlistPromotion(
					emailConfig,
					promoted.event,
					promoted.registration,
					promoted.registration.emailSnapshot,
					promoted.registration.nameSnapshot
				);
			}
		}

		return { success: true, alreadyCancelled: false };
	}
} satisfies Actions;

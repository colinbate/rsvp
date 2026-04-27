import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEventBySlug } from '$lib/server/data/events';
import { findOrCreatePerson, MemberIdConflictError } from '$lib/server/data/people';
import {
	findExistingRegistration,
	getRegisteredCount,
	createRegistration,
	declineRegistration,
	updateRegistrationDetails
} from '$lib/server/data/registrations';
import { isValidEmail } from '$lib/server/utils';
import {
	getEmailConfig,
	sendRegistrationConfirmation,
	sendWaitlistConfirmation,
	sendWaitlistPromotion
} from '$lib/server/email';

const DECLINE_RESPONSES = new Set(['declined', 'decline', 'not_attending', 'not-attending', 'no']);

export const load: PageServerLoad = async ({ params, locals }) => {
	const event = await getEventBySlug(locals.db, params.eventSlug);

	if (!event) {
		return { event: null, error: 'Event not found.' };
	}

	if (event.status !== 'open') {
		return { event, error: 'This event is not currently accepting RSVPs.' };
	}

	return { event, error: null };
};

export const actions = {
	default: async ({ request, params, locals, platform }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim() ?? '';
		const memberId = formData.get('member_id')?.toString().trim() || null;
		const response = formData.get('response')?.toString().trim().toLowerCase() ?? '';
		const isDecline = DECLINE_RESPONSES.has(response);
		const honeypot = formData.get('phone')?.toString() ?? '';
		const redirectTo = formData.get('redirect_to')?.toString() ?? '';

		// Honeypot check — if the hidden field is filled, silently succeed
		if (honeypot) {
			if (redirectTo) {
				return redirect(303, `${redirectTo}?rsvp=success`);
			}
			return redirect(303, `/success?event=${params.eventSlug}`);
		}

		// Validate required fields
		if (!name) {
			return fail(400, { name, email, error: 'Name is required.' });
		}

		if (!email || !isValidEmail(email)) {
			return fail(400, { name, email, error: 'A valid email address is required.' });
		}

		// Look up event
		const event = await getEventBySlug(locals.db, params.eventSlug);
		if (!event) {
			return fail(404, { name, email, error: 'Event not found.' });
		}

		if (event.status !== 'open') {
			return fail(400, { name, email, error: 'This event is not currently accepting RSVPs.' });
		}

		// Find or create person
		let person: Awaited<ReturnType<typeof findOrCreatePerson>>;
		try {
			person = await findOrCreatePerson(locals.db, name, email, memberId);
		} catch (error) {
			if (error instanceof MemberIdConflictError) {
				return fail(400, {
					name,
					email,
					error: 'That member ID is already linked to another email address.'
				});
			}
			throw error;
		}

		const emailConfig = getEmailConfig(platform);

		// Check for existing registration for this event/person pair.
		const existing = await findExistingRegistration(locals.db, event.id, person.id);
		if (existing && isDecline) {
			await updateRegistrationDetails(locals.db, existing.id, {
				nameSnapshot: name,
				emailSnapshot: email,
				memberIdSnapshot: memberId
			});

			if (existing.status !== 'declined') {
				const { promoted } = await declineRegistration(locals.db, existing.id);

				if (emailConfig && promoted) {
					await sendWaitlistPromotion(
						emailConfig,
						promoted.event,
						promoted.registration,
						promoted.registration.emailSnapshot,
						promoted.registration.nameSnapshot
					);
				}
			}

			if (redirectTo) {
				return redirect(303, `${redirectTo}?rsvp=declined`);
			}
			return redirect(303, `/success?event=${params.eventSlug}&status=declined`);
		}

		if (existing && existing.status !== 'cancelled' && existing.status !== 'declined') {
			const message =
				existing.status === 'waitlisted'
					? "You're already on the waitlist for this event."
					: "You're already registered for this event.";

			if (redirectTo) {
				const status = existing.status === 'waitlisted' ? 'waitlisted' : 'duplicate';
				return redirect(303, `${redirectTo}?rsvp=${status}`);
			}
			return fail(400, { name, email, error: message });
		}

		if (isDecline) {
			if (existing) {
				await updateRegistrationDetails(locals.db, existing.id, {
					nameSnapshot: name,
					emailSnapshot: email,
					memberIdSnapshot: memberId,
					status: 'declined'
				});
			} else {
				await createRegistration(locals.db, {
					eventId: event.id,
					personId: person.id,
					nameSnapshot: name,
					emailSnapshot: email,
					memberIdSnapshot: memberId,
					status: 'declined'
				});
			}

			if (redirectTo) {
				return redirect(303, `${redirectTo}?rsvp=declined`);
			}
			return redirect(303, `/success?event=${params.eventSlug}&status=declined`);
		}

		// Check capacity
		const registeredCount = await getRegisteredCount(locals.db, event.id);
		const hasCapacity = registeredCount < event.capacity;

		let status: 'registered' | 'waitlisted';
		if (hasCapacity) {
			status = 'registered';
		} else if (event.waitlistEnabled) {
			status = 'waitlisted';
		} else {
			return fail(400, {
				name,
				email,
				error: 'This event is at capacity and is not accepting a waitlist.'
			});
		}

		// Create or reactivate registration
		const registration = existing
			? await updateRegistrationDetails(locals.db, existing.id, {
					nameSnapshot: name,
					emailSnapshot: email,
					memberIdSnapshot: memberId,
					status
				})
			: await createRegistration(locals.db, {
					eventId: event.id,
					personId: person.id,
					nameSnapshot: name,
					emailSnapshot: email,
					memberIdSnapshot: memberId,
					status
				});

		// Send confirmation email
		if (emailConfig && registration) {
			if (status === 'registered') {
				await sendRegistrationConfirmation(emailConfig, event, registration, email, name);
			} else {
				await sendWaitlistConfirmation(emailConfig, event, registration, email, name);
			}
		}

		// Redirect: if a redirect_to was provided (from Astro form), go back there
		if (redirectTo) {
			return redirect(
				303,
				`${redirectTo}?rsvp=${status === 'registered' ? 'success' : 'waitlisted'}`
			);
		}

		// Otherwise redirect to local success page
		return redirect(303, `/success?event=${params.eventSlug}&status=${status}`);
	}
} satisfies Actions;

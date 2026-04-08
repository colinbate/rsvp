import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEventWithCounts, getEventById } from '$lib/server/data/events';
import {
	getRegistrationsByEvent,
	getRegistrationsByEventAndStatus,
	createRegistration,
	cancelRegistration,
	promoteRegistration,
	updateRegistrationStatus,
	getRegistrationWithEvent,
	regenerateToken,
	type RegistrationStatus
} from '$lib/server/data/registrations';
import { findOrCreatePerson } from '$lib/server/data/people';
import { getRegisteredCount } from '$lib/server/data/registrations';
import {
	isValidEmail,
	getDateInTimezone,
	getTodayInTimezone,
	getTomorrowInTimezone
} from '$lib/server/utils';
import {
	getEmailConfig,
	sendRegistrationConfirmation,
	sendWaitlistConfirmation,
	sendWaitlistPromotion,
	sendCancellationConfirmation,
	sendReminderEmails
} from '$lib/server/email';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		return error(400, 'Invalid event ID.');
	}

	const event = await getEventWithCounts(locals.db, id);
	if (!event) {
		return error(404, 'Event not found.');
	}

	const allRegistrations = await getRegistrationsByEvent(locals.db, id);

	const registered = allRegistrations.filter((r) => r.registration.status === 'registered');
	const waitlisted = allRegistrations.filter((r) => r.registration.status === 'waitlisted');
	const cancelled = allRegistrations.filter((r) => r.registration.status === 'cancelled');
	const attended = allRegistrations.filter((r) => r.registration.status === 'attended');
	const noShow = allRegistrations.filter((r) => r.registration.status === 'no_show');

	return {
		event,
		registered,
		waitlisted,
		cancelled,
		attended,
		noShow
	};
};

export const actions = {
	add: async ({ request, params, locals, platform }) => {
		const id = parseInt(params.id, 10);
		if (isNaN(id)) return fail(400, { addError: 'Invalid event ID.' });

		const event = await getEventById(locals.db, id);
		if (!event) return fail(404, { addError: 'Event not found.' });

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim() ?? '';
		const adminNote = formData.get('admin_note')?.toString().trim() || undefined;

		if (!name) return fail(400, { addError: 'Name is required.', addName: name, addEmail: email });
		if (!email || !isValidEmail(email))
			return fail(400, { addError: 'A valid email is required.', addName: name, addEmail: email });

		const person = await findOrCreatePerson(locals.db, name, email);

		// Check for existing non-cancelled registration
		const { findExistingRegistration } = await import('$lib/server/data/registrations');
		const existing = await findExistingRegistration(locals.db, event.id, person.id);
		if (existing && existing.status !== 'cancelled') {
			return fail(400, {
				addError: 'This person is already registered or waitlisted for this event.',
				addName: name,
				addEmail: email
			});
		}

		const registeredCount = await getRegisteredCount(locals.db, event.id);
		const hasCapacity = registeredCount < event.capacity;
		const status: 'registered' | 'waitlisted' = hasCapacity ? 'registered' : 'waitlisted';

		const registration = await createRegistration(locals.db, {
			eventId: event.id,
			personId: person.id,
			nameSnapshot: name,
			emailSnapshot: email,
			status,
			adminNote
		});

		// Send confirmation email
		const emailConfig = getEmailConfig(platform);
		if (emailConfig) {
			if (status === 'registered') {
				await sendRegistrationConfirmation(emailConfig, event, registration, email, name);
			} else {
				await sendWaitlistConfirmation(emailConfig, event, registration, email, name);
			}
		}

		return {
			addSuccess: `${name} has been ${status === 'registered' ? 'registered' : 'added to the waitlist'}.`
		};
	},

	cancel: async ({ request, locals, platform }) => {
		const formData = await request.formData();
		const registrationId = parseInt(formData.get('registration_id')?.toString() ?? '', 10);
		if (isNaN(registrationId)) return fail(400, { actionError: 'Invalid registration ID.' });

		const regData = await getRegistrationWithEvent(locals.db, registrationId);
		if (!regData) return fail(404, { actionError: 'Registration not found.' });

		const { promoted } = await cancelRegistration(locals.db, registrationId);

		const emailConfig = getEmailConfig(platform);
		if (emailConfig) {
			await sendCancellationConfirmation(
				emailConfig,
				regData.event,
				regData.registration.emailSnapshot,
				regData.registration.nameSnapshot
			);

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

		return { actionSuccess: `${regData.registration.nameSnapshot} has been cancelled.` };
	},

	promote: async ({ request, locals, platform }) => {
		const formData = await request.formData();
		const registrationId = parseInt(formData.get('registration_id')?.toString() ?? '', 10);
		if (isNaN(registrationId)) return fail(400, { actionError: 'Invalid registration ID.' });

		const promoted = await promoteRegistration(locals.db, registrationId);
		if (!promoted)
			return fail(400, {
				actionError: 'Could not promote this registration. It may not be waitlisted.'
			});

		const emailConfig = getEmailConfig(platform);
		if (emailConfig) {
			await sendWaitlistPromotion(
				emailConfig,
				promoted.event,
				promoted.registration,
				promoted.registration.emailSnapshot,
				promoted.registration.nameSnapshot
			);
		}

		return {
			actionSuccess: `${promoted.registration.nameSnapshot} has been promoted from the waitlist.`
		};
	},

	status: async ({ request, locals }) => {
		const formData = await request.formData();
		const registrationId = parseInt(formData.get('registration_id')?.toString() ?? '', 10);
		const newStatus = formData.get('status')?.toString() ?? '';
		if (isNaN(registrationId)) return fail(400, { actionError: 'Invalid registration ID.' });
		if (!['attended', 'no_show', 'registered'].includes(newStatus)) {
			return fail(400, { actionError: 'Invalid status.' });
		}

		const updated = await updateRegistrationStatus(
			locals.db,
			registrationId,
			newStatus as RegistrationStatus
		);
		if (!updated) return fail(404, { actionError: 'Registration not found.' });

		return { actionSuccess: `Status updated to "${newStatus.replace('_', ' ')}".` };
	},

	resend: async ({ request, locals, platform }) => {
		const formData = await request.formData();
		const registrationId = parseInt(formData.get('registration_id')?.toString() ?? '', 10);
		if (isNaN(registrationId)) return fail(400, { actionError: 'Invalid registration ID.' });

		const regData = await getRegistrationWithEvent(locals.db, registrationId);
		if (!regData) return fail(404, { actionError: 'Registration not found.' });

		// Regenerate the token so old links stop working
		await regenerateToken(locals.db, registrationId);
		const updatedData = await getRegistrationWithEvent(locals.db, registrationId);
		if (!updatedData) return fail(500, { actionError: 'Failed to reload registration.' });

		const emailConfig = getEmailConfig(platform);
		if (!emailConfig) return fail(500, { actionError: 'Email is not configured.' });

		if (
			updatedData.registration.status === 'registered' ||
			updatedData.registration.status === 'attended'
		) {
			await sendRegistrationConfirmation(
				emailConfig,
				updatedData.event,
				updatedData.registration,
				updatedData.registration.emailSnapshot,
				updatedData.registration.nameSnapshot
			);
		} else if (updatedData.registration.status === 'waitlisted') {
			await sendWaitlistConfirmation(
				emailConfig,
				updatedData.event,
				updatedData.registration,
				updatedData.registration.emailSnapshot,
				updatedData.registration.nameSnapshot
			);
		}

		return {
			actionSuccess: `Confirmation email resent to ${updatedData.registration.emailSnapshot}.`
		};
	},

	remind: async ({ params, locals, platform }) => {
		const id = parseInt(params.id, 10);
		if (isNaN(id)) return fail(400, { actionError: 'Invalid event ID.' });

		const event = await getEventById(locals.db, id);
		if (!event) return fail(404, { actionError: 'Event not found.' });

		const eventDate = getDateInTimezone(event.startsAt, event.timezone);
		const today = getTodayInTimezone(event.timezone);
		const tomorrow = getTomorrowInTimezone(event.timezone);

		let timing: 'today' | 'tomorrow';
		if (eventDate === today) {
			timing = 'today';
		} else if (eventDate === tomorrow) {
			timing = 'tomorrow';
		} else {
			return fail(400, {
				actionError: 'Reminders can only be sent the day before or the day of the event.'
			});
		}

		const registrations = await getRegistrationsByEventAndStatus(locals.db, id, 'registered');
		if (registrations.length === 0) {
			return fail(400, { actionError: 'No registered attendees to remind.' });
		}

		const emailConfig = getEmailConfig(platform);
		if (!emailConfig) return fail(500, { actionError: 'Email is not configured.' });

		const recipients = registrations.map((r) => ({
			name: r.registration.nameSnapshot,
			email: r.registration.emailSnapshot,
			confirmationToken: r.registration.confirmationToken
		}));

		const result = await sendReminderEmails(emailConfig, event, recipients, timing);

		let message = `Reminder sent to ${result.sent} attendee(s).`;
		if (result.failed > 0) {
			message += ` (${result.failed} failed)`;
		}

		return { actionSuccess: message };
	}
} satisfies Actions;

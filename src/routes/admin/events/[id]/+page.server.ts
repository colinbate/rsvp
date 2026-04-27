import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEventWithCounts, getEventById } from '$lib/server/data/events';
import {
	getRegistrationsByEvent,
	getRegistrationsByEventAndStatus,
	createRegistration,
	cancelRegistration,
	declineRegistration,
	promoteRegistration,
	updateRegistrationDetails,
	updateRegistrationStatus,
	getRegistrationWithEvent,
	regenerateToken,
	type RegistrationStatus
} from '$lib/server/data/registrations';
import {
	findOrCreatePersonByNameAndOptionalEmail,
	MemberIdConflictError
} from '$lib/server/data/people';
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
	const declined = allRegistrations.filter((r) => r.registration.status === 'declined');

	return {
		event,
		registered,
		waitlisted,
		cancelled,
		attended,
		noShow,
		declined
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
		const memberId = formData.get('member_id')?.toString().trim() || null;
		const adminNote = formData.get('admin_note')?.toString().trim() || undefined;
		const responseStatus = formData.get('response_status')?.toString() ?? 'attending';
		const sendEmail = formData.has('send_email');

		if (!name) {
			return fail(400, {
				addError: 'Name is required.',
				addName: name,
				addEmail: email,
				addMemberId: memberId ?? ''
			});
		}

		// Email is optional, but if provided it must be valid
		if (email && !isValidEmail(email)) {
			return fail(400, {
				addError: 'Please enter a valid email address.',
				addName: name,
				addEmail: email,
				addMemberId: memberId ?? ''
			});
		}

		let person: Awaited<ReturnType<typeof findOrCreatePersonByNameAndOptionalEmail>>;
		try {
			person = await findOrCreatePersonByNameAndOptionalEmail(
				locals.db,
				name,
				email || undefined,
				memberId
			);
		} catch (error) {
			if (error instanceof MemberIdConflictError) {
				return fail(400, {
					addError: 'That member ID is already linked to another email address.',
					addName: name,
					addEmail: email,
					addMemberId: memberId ?? ''
				});
			}
			throw error;
		}

		const { findExistingRegistration } = await import('$lib/server/data/registrations');
		const existing = await findExistingRegistration(locals.db, event.id, person.id);

		const isCompleted = event.status === 'completed';
		let status: 'registered' | 'waitlisted' | 'attended' | 'declined';

		if (responseStatus === 'declined') {
			status = 'declined';
		} else if (isCompleted) {
			status = 'attended';
		} else {
			const registeredCount = await getRegisteredCount(locals.db, event.id);
			const hasCapacity = registeredCount < event.capacity;
			status = hasCapacity ? 'registered' : 'waitlisted';
		}

		let registration;
		let promoted = null;
		if (existing && existing.status !== 'cancelled' && existing.status !== 'declined') {
			if (status !== 'declined') {
				return fail(400, {
					addError: 'This person already has an active RSVP for this event.',
					addName: name,
					addEmail: email,
					addMemberId: memberId ?? ''
				});
			}

			await updateRegistrationDetails(locals.db, existing.id, {
				nameSnapshot: name,
				emailSnapshot: email,
				memberIdSnapshot: memberId,
				adminNote: adminNote ?? null
			});
			const result = await declineRegistration(locals.db, existing.id);
			registration = result.declined;
			promoted = result.promoted;
		} else if (existing) {
			registration = await updateRegistrationDetails(locals.db, existing.id, {
				nameSnapshot: name,
				emailSnapshot: email,
				memberIdSnapshot: memberId,
				status,
				adminNote: adminNote ?? (isCompleted && !email ? 'Walk-in attendee' : null)
			});
		} else {
			registration = await createRegistration(locals.db, {
				eventId: event.id,
				personId: person.id,
				nameSnapshot: name,
				emailSnapshot: email,
				memberIdSnapshot: memberId,
				status,
				adminNote: adminNote ?? (isCompleted && !email ? 'Walk-in attendee' : undefined)
			});
		}

		// Only send email if explicitly requested and a valid email is provided
		if (sendEmail && email && registration) {
			const emailConfig = getEmailConfig(platform);
			if (emailConfig) {
				if (status === 'registered') {
					await sendRegistrationConfirmation(emailConfig, event, registration, email, name);
				} else if (status === 'waitlisted') {
					await sendWaitlistConfirmation(emailConfig, event, registration, email, name);
				}
				// Don't send confirmation for 'attended' status — the event is already over
			}
		}

		if (promoted) {
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
		}

		let statusLabel = 'added to the waitlist';
		if (status === 'declined') {
			statusLabel = 'recorded as declined';
		} else if (isCompleted) {
			statusLabel = 'recorded as attended';
		} else if (status === 'registered') {
			statusLabel = 'registered';
		}

		return { addSuccess: `${name} has been ${statusLabel}.` };
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

	status: async ({ request, locals, platform }) => {
		const formData = await request.formData();
		const registrationId = parseInt(formData.get('registration_id')?.toString() ?? '', 10);
		const newStatus = formData.get('status')?.toString() ?? '';
		if (isNaN(registrationId)) return fail(400, { actionError: 'Invalid registration ID.' });
		if (!['attended', 'no_show', 'registered', 'declined'].includes(newStatus)) {
			return fail(400, { actionError: 'Invalid status.' });
		}

		if (newStatus === 'declined') {
			const regData = await getRegistrationWithEvent(locals.db, registrationId);
			if (!regData) return fail(404, { actionError: 'Registration not found.' });

			const { promoted } = await declineRegistration(locals.db, registrationId);

			const emailConfig = getEmailConfig(platform);
			if (emailConfig && promoted) {
				await sendWaitlistPromotion(
					emailConfig,
					promoted.event,
					promoted.registration,
					promoted.registration.emailSnapshot,
					promoted.registration.nameSnapshot
				);
			}

			return { actionSuccess: `${regData.registration.nameSnapshot} has been marked declined.` };
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

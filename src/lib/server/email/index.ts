import { formatDateTime } from '$lib/server/utils';
import type { Event, Registration } from '$lib/server/db/schema';
import { Resend } from 'resend';

interface EmailConfig {
	apiKey: string;
	fromAddress: string;
	appUrl: string;
}

interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
}

async function sendEmail(config: EmailConfig, params: SendEmailParams): Promise<boolean> {
	try {
		const resend = new Resend(config.apiKey);
		const { error } = await resend.emails.send({
			from: config.fromAddress,
			to: [params.to],
			subject: params.subject,
			html: params.html
		});

		if (error) {
			console.error(`Resend API error (${error.statusCode}): ${error.message}`);
			return false;
		}
		return true;
	} catch (error) {
		console.error('Failed to send email:', error);
		return false;
	}
}

function eventDetailsHtml(event: Event): string {
	const locationLine = event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : '';
	const endsLine = event.endsAt
		? `<p><strong>Ends:</strong> ${formatDateTime(event.endsAt, event.timezone)}</p>`
		: '';
	const canonicalLine = event.canonicalUrl
		? `<p><a href="${event.canonicalUrl}">View full event details &rarr;</a></p>`
		: '';

	return `
		<div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
			<h3 style="margin: 0 0 8px 0; color: #7c3aed;">${event.title}</h3>
			<p><strong>When:</strong> ${formatDateTime(event.startsAt, event.timezone)}</p>
			${endsLine}
			${locationLine}
			${canonicalLine}
		</div>
	`;
}

function emailWrapper(content: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
	${content}
	<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
	<p style="font-size: 12px; color: #6b7280;">
		Bermuda Triangle Society &mdash; RSVP System<br>
		If you have questions, you can reply to this email.
	</p>
</body>
</html>`;
}

export async function sendRegistrationConfirmation(
	config: EmailConfig,
	event: Event,
	registration: Registration,
	recipientEmail: string,
	recipientName: string
): Promise<boolean> {
	const cancelUrl = `${config.appUrl}/cancel/${registration.confirmationToken}`;

	const html = emailWrapper(`
		<h2 style="color: #7c3aed;">You're registered! 🎉</h2>
		<p>Hi ${recipientName},</p>
		<p>Your RSVP for the following event has been confirmed:</p>
		${eventDetailsHtml(event)}
		<p>We look forward to seeing you there!</p>
		<p style="margin-top: 24px;">
			<strong>Need to cancel?</strong><br>
			<a href="${cancelUrl}" style="color: #7c3aed;">Click here to cancel your registration</a>
		</p>
	`);

	return sendEmail(config, {
		to: recipientEmail,
		subject: `RSVP Confirmed: ${event.title}`,
		html
	});
}

export async function sendWaitlistConfirmation(
	config: EmailConfig,
	event: Event,
	registration: Registration,
	recipientEmail: string,
	recipientName: string
): Promise<boolean> {
	const cancelUrl = `${config.appUrl}/cancel/${registration.confirmationToken}`;

	const html = emailWrapper(`
		<h2 style="color: #7c3aed;">You're on the waitlist</h2>
		<p>Hi ${recipientName},</p>
		<p>The event below is currently at capacity, but you've been added to the waitlist. We'll notify you immediately if a spot opens up!</p>
		${eventDetailsHtml(event)}
		<p style="margin-top: 24px;">
			<strong>Changed your mind?</strong><br>
			<a href="${cancelUrl}" style="color: #7c3aed;">Click here to remove yourself from the waitlist</a>
		</p>
	`);

	return sendEmail(config, {
		to: recipientEmail,
		subject: `Waitlisted: ${event.title}`,
		html
	});
}

export async function sendWaitlistPromotion(
	config: EmailConfig,
	event: Event,
	registration: Registration,
	recipientEmail: string,
	recipientName: string
): Promise<boolean> {
	const cancelUrl = `${config.appUrl}/cancel/${registration.confirmationToken}`;

	const html = emailWrapper(`
		<h2 style="color: #7c3aed;">A spot opened up! 🎉</h2>
		<p>Hi ${recipientName},</p>
		<p>Great news! A spot has become available and you've been moved from the waitlist to a confirmed registration for:</p>
		${eventDetailsHtml(event)}
		<p>We look forward to seeing you there!</p>
		<p style="margin-top: 24px;">
			<strong>Need to cancel?</strong><br>
			<a href="${cancelUrl}" style="color: #7c3aed;">Click here to cancel your registration</a>
		</p>
	`);

	return sendEmail(config, {
		to: recipientEmail,
		subject: `You're in! Spot confirmed: ${event.title}`,
		html
	});
}

export async function sendCancellationConfirmation(
	config: EmailConfig,
	event: Event,
	recipientEmail: string,
	recipientName: string
): Promise<boolean> {
	const html = emailWrapper(`
		<h2 style="color: #7c3aed;">Registration cancelled</h2>
		<p>Hi ${recipientName},</p>
		<p>Your registration for the following event has been cancelled:</p>
		${eventDetailsHtml(event)}
		<p>If this was a mistake, you can register again from the event page.</p>
	`);

	return sendEmail(config, {
		to: recipientEmail,
		subject: `Registration Cancelled: ${event.title}`,
		html
	});
}

export async function sendReminderEmails(
	config: EmailConfig,
	event: Event,
	recipients: Array<{ name: string; email: string; confirmationToken: string }>,
	timing: 'today' | 'tomorrow'
): Promise<{ sent: number; failed: number }> {
	let sent = 0;
	let failed = 0;

	const resend = new Resend(config.apiKey);

	const emailObjects = recipients.map((recipient) => {
		const cancelUrl = `${config.appUrl}/cancel/${recipient.confirmationToken}`;

		const html = emailWrapper(`
		<h2 style="color: #7c3aed;">Event Reminder ⏰</h2>
		<p>Hi ${recipient.name},</p>
		<p>Just a friendly reminder that the following event is <strong>${timing}</strong>!</p>
		${eventDetailsHtml(event)}
		<p>We look forward to seeing you there!</p>
		<p style="margin-top: 24px;">
			<strong>Need to cancel?</strong><br>
			<a href="${cancelUrl}" style="color: #7c3aed;">Click here to cancel your registration</a>
		</p>
	`);

		return {
			from: config.fromAddress,
			to: [recipient.email],
			subject: `Reminder: ${event.title} is ${timing}!`,
			html
		};
	});

	// Chunk into batches of 100
	for (let i = 0; i < emailObjects.length; i += 100) {
		const batch = emailObjects.slice(i, i + 100);

		try {
			const { data, error } = await resend.batch.send(batch);

			if (error) {
				console.error(`Resend batch API error: ${error.message}`);
				failed += batch.length;
			} else {
				sent += data ? data.data.length : batch.length;
			}
		} catch (error) {
			console.error('Failed to send reminder email batch:', error);
			failed += batch.length;
		}
	}

	return { sent, failed };
}

export function getEmailConfig(platform: App.Platform | undefined): EmailConfig | null {
	const env = platform?.env as Record<string, string> | undefined;
	const apiKey = env?.RESEND_API_KEY;
	const fromAddress =
		env?.EMAIL_FROM ?? 'Bermuda Triangle Society <notify@rsvp.bermudatrianglesociety.com>';
	const appUrl = env?.APP_URL ?? 'https://rsvp.bermudatrianglesociety.com';

	if (!apiKey) {
		console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
		return null;
	}

	return { apiKey, fromAddress, appUrl };
}

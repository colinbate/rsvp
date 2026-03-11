import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getEventById } from '$lib/server/data/events';
import { getRegistrationsByEvent } from '$lib/server/data/registrations';

function escapeCSV(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export const GET: RequestHandler = async ({ params, locals }) => {
	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		return error(400, 'Invalid event ID.');
	}

	const event = await getEventById(locals.db, id);
	if (!event) {
		return error(404, 'Event not found.');
	}

	const registrations = await getRegistrationsByEvent(locals.db, id);

	const headers = ['Name', 'Email', 'Status', 'Registered At', 'Updated At', 'Admin Note'];
	const rows = registrations.map(({ registration }) => [
		escapeCSV(registration.nameSnapshot),
		escapeCSV(registration.emailSnapshot),
		escapeCSV(registration.status),
		escapeCSV(registration.createdAt),
		escapeCSV(registration.updatedAt),
		escapeCSV(registration.adminNote ?? '')
	]);

	const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

	const slug = event.slug || 'event';
	const filename = `${slug}-registrations.csv`;

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};

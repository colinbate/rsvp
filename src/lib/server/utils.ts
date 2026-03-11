/**
 * Normalize an email address for deduplication.
 * Lowercases the entire address and trims whitespace.
 */
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/**
 * Generate a random URL-safe token for confirmation/cancellation links.
 */
export function generateToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Slugify a string for use in URLs.
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Format a datetime string for display.
 * Expects an ISO 8601 string stored in the DB.
 */
export function formatDateTime(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});
}

/**
 * Validate an email address (basic check).
 */
export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

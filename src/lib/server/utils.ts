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
 * Expects an ISO 8601 UTC string stored in the DB.
 * When a timezone is provided, displays the time in that timezone.
 */
export function formatDateTime(dateStr: string, timezone = 'Atlantic/Bermuda'): string {
	const date = new Date(dateStr);
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short',
		timeZone: timezone
	};
	return date.toLocaleDateString('en-US', options);
}

/**
 * Convert a datetime-local input value to a UTC ISO string.
 * The input value is a naive datetime (e.g. "2025-06-15T14:00") that should be
 * interpreted in the given IANA timezone.
 */
export function localDatetimeToUTC(datetimeLocal: string, timezone: string): string {
	// datetime-local gives us "YYYY-MM-DDTHH:mm" with no timezone info.
	// We need to figure out what UTC instant this corresponds to in the given timezone.
	// We use Intl.DateTimeFormat to find the offset for that timezone at the given time,
	// then apply it.

	// First, parse the naive datetime as if it were UTC to get its component parts
	const naive = new Date(datetimeLocal + 'Z');
	if (isNaN(naive.getTime())) {
		// Fall back to treating it as-is
		return new Date(datetimeLocal).toISOString();
	}

	// Use a formatter to find what the local time would be in the target timezone
	// at this UTC instant. The difference tells us the offset.
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});

	// We'll use an iterative approach: start with the naive datetime as UTC,
	// find what time that is in the target timezone, compute the difference,
	// and adjust.
	const parts = formatter.formatToParts(naive);
	const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

	const tzYear = get('year');
	const tzMonth = get('month');
	const tzDay = get('day');
	const tzHour = get('hour') === 24 ? 0 : get('hour');
	const tzMinute = get('minute');

	// Build the "local time as seen in timezone" when we fed the naive UTC instant
	const localAtUTC = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute);

	// The offset is: localAtUTC - naive (in ms)
	// So to go from local -> UTC: utc = naive - offset
	const offsetMs = localAtUTC - naive.getTime();
	const utc = new Date(naive.getTime() - offsetMs);

	return utc.toISOString();
}

/**
 * Get the date string (YYYY-MM-DD) for a UTC datetime as seen in a given timezone.
 */
export function getDateInTimezone(utcDateStr: string, timezone: string): string {
	const date = new Date(utcDateStr);
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	return formatter.format(date);
}

/**
 * Get today's date string (YYYY-MM-DD) in a given timezone.
 */
export function getTodayInTimezone(timezone: string): string {
	return getDateInTimezone(new Date().toISOString(), timezone);
}

/**
 * Get tomorrow's date string (YYYY-MM-DD) in a given timezone.
 */
export function getTomorrowInTimezone(timezone: string): string {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return getDateInTimezone(tomorrow.toISOString(), timezone);
}

/**
 * Validate an email address (basic check).
 */
export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

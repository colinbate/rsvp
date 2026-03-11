<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	type EventData = {
		id?: number;
		title?: string;
		slug?: string;
		canonicalUrl?: string | null;
		location?: string | null;
		startsAt?: string;
		endsAt?: string | null;
		capacity?: number;
		waitlistEnabled?: boolean;
		status?: string;
	};

	let { event = {} as EventData, error = null as string | null, isEdit = false } = $props();

	function generateSlug() {
		const titleInput = document.getElementById('title') as HTMLInputElement | null;
		const slugInput = document.getElementById('slug') as HTMLInputElement | null;
		if (titleInput && slugInput && !slugInput.value) {
			slugInput.value = titleInput.value
				.toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_]+/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	}

	// Format a datetime string for the datetime-local input
	function toLocalDatetime(dateStr: string | null | undefined): string {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		// Format as YYYY-MM-DDTHH:mm
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}
</script>

{#if error}
	<div
		class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
	>
		{error}
	</div>
{/if}

<form method="POST" use:enhance class="space-y-6">
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Title</label
			>
			<input
				type="text"
				id="title"
				name="title"
				required
				value={event.title ?? ''}
				onblur={generateSlug}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
		</div>

		<div>
			<label for="slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Slug</label
			>
			<input
				type="text"
				id="slug"
				name="slug"
				required
				value={event.slug ?? ''}
				pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
				class="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				URL-safe identifier (e.g. "june-2025-book-club")
			</p>
		</div>

		<div>
			<label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Status</label
			>
			<select
				id="status"
				name="status"
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			>
				{#each ['draft', 'open', 'closed', 'cancelled', 'completed'] as s (s)}
					<option value={s} selected={event.status === s || (!event.status && s === 'draft')}>
						{s.charAt(0).toUpperCase() + s.slice(1)}
					</option>
				{/each}
			</select>
		</div>

		<div class="sm:col-span-2">
			<label for="canonical_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Canonical Event URL
			</label>
			<input
				type="url"
				id="canonical_url"
				name="canonical_url"
				value={event.canonicalUrl ?? ''}
				placeholder="https://bermudatrianglesociety.com/events/..."
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				Link back to the event page on the main Astro site
			</p>
		</div>

		<div class="sm:col-span-2">
			<label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Location</label
			>
			<input
				type="text"
				id="location"
				name="location"
				value={event.location ?? ''}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
		</div>

		<div>
			<label for="starts_at" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Starts at</label
			>
			<input
				type="datetime-local"
				id="starts_at"
				name="starts_at"
				required
				value={toLocalDatetime(event.startsAt)}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
		</div>

		<div>
			<label for="ends_at" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Ends at</label
			>
			<input
				type="datetime-local"
				id="ends_at"
				name="ends_at"
				value={toLocalDatetime(event.endsAt)}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
		</div>

		<div>
			<label for="capacity" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Capacity</label
			>
			<input
				type="number"
				id="capacity"
				name="capacity"
				required
				min="1"
				value={event.capacity ?? 20}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-purple-400 dark:focus:ring-purple-400"
			/>
		</div>

		<div class="flex items-center gap-3 self-end pb-2">
			<input
				type="checkbox"
				id="waitlist_enabled"
				name="waitlist_enabled"
				checked={event.waitlistEnabled ?? true}
				class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-purple-500 dark:focus:ring-purple-400"
			/>
			<label for="waitlist_enabled" class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Enable waitlist
			</label>
		</div>
	</div>

	<div class="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
		<a
			href={resolve('/admin')}
			class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
		>
			Cancel
		</a>
		<button
			type="submit"
			class="rounded-md bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus-visible:outline-purple-400"
		>
			{isEdit ? 'Save Changes' : 'Create Event'}
		</button>
	</div>
</form>

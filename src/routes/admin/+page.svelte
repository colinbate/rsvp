<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'open':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'draft':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
			case 'closed':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'completed':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard — BTS Admin</title>
</svelte:head>

<div class="mb-8 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage events and registrations</p>
	</div>
	<a
		href={resolve('/admin/events/new')}
		class="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600"
	>
		+ New Event
	</a>
</div>

<!-- Upcoming Events -->
<section class="mb-10">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Events</h2>
	{#if data.upcoming.length === 0}
		<div
			class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-600 dark:bg-gray-800"
		>
			<p class="text-sm text-gray-500 dark:text-gray-400">No upcoming events.</p>
			<a
				href={resolve('/admin/events/new')}
				class="mt-2 inline-block text-sm font-medium text-purple-700 underline hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
			>
				Create one &rarr;
			</a>
		</div>
	{:else}
		<div
			class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-700/50">
					<tr>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Event</th
						>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Date</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Status</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Registered</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Waitlist</th
						>
						<th
							class="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
					{#each data.upcoming as event (event.id)}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<td class="px-4 py-3">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="font-medium text-gray-900 hover:text-purple-700 dark:text-gray-100 dark:hover:text-purple-400"
								>
									{event.title}
								</a>
								{#if event.location}
									<p class="text-xs text-gray-500 dark:text-gray-400">{event.location}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
								{formatDate(event.startsAt)}
							</td>
							<td class="px-4 py-3 text-center whitespace-nowrap">
								<span
									class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {statusBadgeClass(
										event.status
									)}"
								>
									{event.status}
								</span>
							</td>
							<td class="px-4 py-3 text-center text-sm whitespace-nowrap">
								<span class="font-medium text-gray-900 dark:text-gray-100"
									>{event.registeredCount}</span
								>
								<span class="text-gray-400 dark:text-gray-500">/ {event.capacity}</span>
							</td>
							<td class="px-4 py-3 text-center text-sm whitespace-nowrap">
								{#if event.waitlistEnabled}
									<span class="text-gray-700 dark:text-gray-300">{event.waitlistedCount}</span>
								{:else}
									<span class="text-gray-400 dark:text-gray-500">—</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right whitespace-nowrap">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="text-sm text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
								>
									View
								</a>
								<span class="mx-1 text-gray-300 dark:text-gray-600">·</span>
								<a
									href={resolve(`/admin/events/${event.id}/edit`)}
									class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
								>
									Edit
								</a>
								<span class="mx-1 text-gray-300 dark:text-gray-600">·</span>
								<a
									href={resolve(`/admin/events/${event.id}/export.csv`)}
									class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
								>
									CSV
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<!-- Past Events -->
<section>
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
		Past &amp; Cancelled Events
	</h2>
	{#if data.past.length === 0}
		<p class="text-sm text-gray-500 dark:text-gray-400">No past events yet.</p>
	{:else}
		<div
			class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-700/50">
					<tr>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Event</th
						>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Date</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Status</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Attended</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Registered</th
						>
						<th
							class="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
					{#each data.past as event (event.id)}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<td class="px-4 py-3">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="font-medium text-gray-900 hover:text-purple-700 dark:text-gray-100 dark:hover:text-purple-400"
								>
									{event.title}
								</a>
								{#if event.location}
									<p class="text-xs text-gray-500 dark:text-gray-400">{event.location}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
								{formatDate(event.startsAt)}
							</td>
							<td class="px-4 py-3 text-center whitespace-nowrap">
								<span
									class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {statusBadgeClass(
										event.status
									)}"
								>
									{event.status}
								</span>
							</td>
							<td class="px-4 py-3 text-center text-sm whitespace-nowrap">
								<span class="text-gray-700 dark:text-gray-300">{event.attendedCount}</span>
							</td>
							<td class="px-4 py-3 text-center text-sm whitespace-nowrap">
								<span class="text-gray-700 dark:text-gray-300">{event.registeredCount}</span>
								<span class="text-gray-400 dark:text-gray-500">/ {event.capacity}</span>
							</td>
							<td class="px-4 py-3 text-right whitespace-nowrap">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="text-sm text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
								>
									View
								</a>
								<span class="mx-1 text-gray-300 dark:text-gray-600">·</span>
								<a
									href={resolve(`/admin/events/${event.id}/export.csv`)}
									class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
								>
									CSV
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'open':
				return 'bg-green-100 text-green-800';
			case 'draft':
				return 'bg-gray-100 text-gray-800';
			case 'closed':
				return 'bg-yellow-100 text-yellow-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
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
		<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-500">Manage events and registrations</p>
	</div>
	<a
		href={resolve('/admin/events/new')}
		class="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
	>
		+ New Event
	</a>
</div>

<!-- Upcoming Events -->
<section class="mb-10">
	<h2 class="mb-4 text-lg font-semibold text-gray-900">Upcoming Events</h2>
	{#if data.upcoming.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
			<p class="text-sm text-gray-500">No upcoming events.</p>
			<a
				href={resolve('/admin/events/new')}
				class="mt-2 inline-block text-sm font-medium text-purple-700 underline hover:text-purple-900"
			>
				Create one &rarr;
			</a>
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Event</th
						>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Date</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Status</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Registered</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Waitlist</th
						>
						<th
							class="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.upcoming as event (event.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="font-medium text-gray-900 hover:text-purple-700"
								>
									{event.title}
								</a>
								{#if event.location}
									<p class="text-xs text-gray-500">{event.location}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
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
								<span class="font-medium text-gray-900">{event.registeredCount}</span>
								<span class="text-gray-400">/ {event.capacity}</span>
							</td>
							<td class="px-4 py-3 text-center text-sm whitespace-nowrap">
								{#if event.waitlistEnabled}
									<span class="text-gray-700">{event.waitlistedCount}</span>
								{:else}
									<span class="text-gray-400">—</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right whitespace-nowrap">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="text-sm text-purple-700 hover:text-purple-900"
								>
									View
								</a>
								<span class="mx-1 text-gray-300">·</span>
								<a
									href={resolve(`/admin/events/${event.id}/edit`)}
									class="text-sm text-gray-600 hover:text-gray-900"
								>
									Edit
								</a>
								<span class="mx-1 text-gray-300">·</span>
								<a
									href={resolve(`/admin/events/${event.id}/export.csv`)}
									class="text-sm text-gray-600 hover:text-gray-900"
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
	<h2 class="mb-4 text-lg font-semibold text-gray-900">Past &amp; Cancelled Events</h2>
	{#if data.past.length === 0}
		<p class="text-sm text-gray-500">No past events yet.</p>
	{:else}
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Event</th
						>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Date</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Status</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Attended</th
						>
						<th
							class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Registered</th
						>
						<th
							class="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.past as event (event.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="font-medium text-gray-900 hover:text-purple-700"
								>
									{event.title}
								</a>
								{#if event.location}
									<p class="text-xs text-gray-500">{event.location}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
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
								<span class="text-gray-700">{event.attendedCount}</span>
							</td>
							<td class="px-4 py-3 text-center text-sm whitespace-nowrap">
								<span class="text-gray-700">{event.registeredCount}</span>
								<span class="text-gray-400">/ {event.capacity}</span>
							</td>
							<td class="px-4 py-3 text-right whitespace-nowrap">
								<a
									href={resolve(`/admin/events/${event.id}`)}
									class="text-sm text-purple-700 hover:text-purple-900"
								>
									View
								</a>
								<span class="mx-1 text-gray-300">·</span>
								<a
									href={resolve(`/admin/events/${event.id}/export.csv`)}
									class="text-sm text-gray-600 hover:text-gray-900"
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

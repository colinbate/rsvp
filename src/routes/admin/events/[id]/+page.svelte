<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	let showCancelled = $state(false);

	// Safely access form properties that only exist on some action return types
	function formVal(key: string): string {
		if (form && typeof form === 'object' && key in form) {
			return String((form as Record<string, unknown>)[key] ?? '');
		}
		return '';
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

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'open':
				return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
			case 'draft':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
			case 'closed':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
			case 'completed':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
		}
	}

	const spotsRemaining = $derived(data.event.capacity - data.event.registeredCount);
</script>

<svelte:head>
	<title>{data.event.title} — BTS Admin</title>
</svelte:head>

<!-- Breadcrumb -->
<div class="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
	<a href={resolve('/admin')} class="hover:text-purple-700 dark:hover:text-purple-400">Dashboard</a>
	<span>&rsaquo;</span>
	<span class="text-gray-700 dark:text-gray-200">{data.event.title}</span>
</div>

<!-- Flash messages -->
{#if form?.addSuccess}
	<div
		class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
	>
		{form.addSuccess}
	</div>
{/if}
{#if form?.addError}
	<div
		class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
	>
		{form.addError}
	</div>
{/if}
{#if form?.actionSuccess}
	<div
		class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
	>
		{form.actionSuccess}
	</div>
{/if}
{#if form?.actionError}
	<div
		class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
	>
		{form.actionError}
	</div>
{/if}

<!-- Event Header -->
<div
	class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.event.title}</h1>
				<span
					class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeClass(
						data.event.status
					)}"
				>
					{data.event.status}
				</span>
			</div>
			<div class="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
				<p>📅 {formatDate(data.event.startsAt)}</p>
				{#if data.event.endsAt}
					<p>🏁 {formatDate(data.event.endsAt)}</p>
				{/if}
				{#if data.event.location}
					<p>📍 {data.event.location}</p>
				{/if}
				{#if data.event.canonicalUrl}
					<p>
						🔗
						<a
							href={data.event.canonicalUrl}
							target="_blank"
							rel="noopener noreferrer external"
							class="text-purple-700 underline hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
						>
							Event page
						</a>
					</p>
				{/if}
				<p class="font-mono text-xs text-gray-400 dark:text-gray-500">slug: {data.event.slug}</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-2">
			<a
				href={resolve(`/admin/events/${data.event.id}/edit`)}
				class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
			>
				Edit Event
			</a>
			<a
				href={resolve(`/admin/events/${data.event.id}/export.csv`)}
				class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
			>
				Export CSV
			</a>
			<a
				href={resolve(`/rsvp/${data.event.slug}`)}
				target="_blank"
				class="rounded-md border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 shadow-sm hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
			>
				RSVP Page ↗
			</a>
			<form method="POST" action="?/remind" use:enhance>
				<button
					type="submit"
					class="cursor-pointer rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
				>
					📧 Send Reminder
				</button>
			</form>
		</div>
	</div>

	<!-- Stats row -->
	<div
		class="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-5 dark:border-gray-700"
	>
		<div class="text-center">
			<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				{data.event.registeredCount}
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Registered</p>
		</div>
		<div class="text-center">
			<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.event.capacity}</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
		</div>
		<div class="text-center">
			<p
				class="text-2xl font-bold {spotsRemaining > 0
					? 'text-green-700 dark:text-green-400'
					: 'text-red-600 dark:text-red-400'}"
			>
				{spotsRemaining}
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Spots Left</p>
		</div>
		<div class="text-center">
			<p class="text-2xl font-bold text-amber-600 dark:text-amber-400">
				{data.event.waitlistedCount}
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Waitlisted</p>
		</div>
		<div class="text-center">
			<p class="text-2xl font-bold text-blue-700 dark:text-blue-400">{data.event.attendedCount}</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Attended</p>
		</div>
	</div>
</div>

<!-- Add Attendee -->
<div
	class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
		{data.event.status === 'completed' ? 'Record Walk-in' : 'Add Attendee'}
	</h2>
	{#if data.event.status === 'completed'}
		<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
			This event is completed. Added attendees will be recorded as having attended. Email is
			optional.
		</p>
	{/if}
	<form method="POST" action="?/add" use:enhance class="space-y-4">
		<div class="flex flex-wrap items-end gap-3">
			<div class="min-w-0 flex-1">
				<label for="add-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Name</label
				>
				<input
					type="text"
					id="add-name"
					name="name"
					required
					value={formVal('addName')}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
				/>
			</div>
			<div class="min-w-0 flex-1">
				<label for="add-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Email <span class="text-gray-400 dark:text-gray-500">(optional)</span></label
				>
				<input
					type="email"
					id="add-email"
					name="email"
					value={formVal('addEmail')}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
				/>
			</div>
			<div class="min-w-0 flex-1">
				<label for="add-note" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Note <span class="text-gray-400 dark:text-gray-500">(optional)</span></label
				>
				<input
					type="text"
					id="add-note"
					name="admin_note"
					placeholder={data.event.status === 'completed' ? 'Walk-in attendee' : 'Added by admin'}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
				/>
			</div>
		</div>
		<div class="flex items-center justify-between">
			<label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
				<input
					type="checkbox"
					name="send_email"
					class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-purple-500 dark:focus:ring-purple-400"
				/>
				Send notification email
			</label>
			<button
				type="submit"
				class="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 dark:bg-purple-500 dark:hover:bg-purple-400"
			>
				{data.event.status === 'completed' ? 'Record' : 'Add'}
			</button>
		</div>
	</form>
</div>

<!-- Registered Attendees -->
<section class="mb-8">
	<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
		Registered
		<span class="text-sm font-normal text-gray-500 dark:text-gray-400"
			>({data.registered.length})</span
		>
	</h2>
	{#if data.registered.length === 0}
		<p
			class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
		>
			No registered attendees yet.
		</p>
	{:else}
		<div
			class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-700/50">
					<tr>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Name</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Email</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Registered</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Note</th
						>
						<th
							class="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
					{#each data.registered as { registration } (registration.id)}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<td class="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100"
								>{registration.nameSnapshot}</td
							>
							<td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400"
								>{registration.emailSnapshot}</td
							>
							<td class="px-4 py-2.5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
								>{formatDate(registration.createdAt)}</td
							>
							<td class="px-4 py-2.5 text-sm text-gray-400 italic dark:text-gray-500"
								>{registration.adminNote ?? ''}</td
							>
							<td class="px-4 py-2.5 text-right whitespace-nowrap">
								<div class="flex items-center justify-end gap-1">
									<form method="POST" action="?/status" use:enhance>
										<input type="hidden" name="registration_id" value={registration.id} />
										<input type="hidden" name="status" value="attended" />
										<button
											type="submit"
											class="rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
											title="Mark as attended"
										>
											✓ Attended
										</button>
									</form>
									<form method="POST" action="?/status" use:enhance>
										<input type="hidden" name="registration_id" value={registration.id} />
										<input type="hidden" name="status" value="no_show" />
										<button
											type="submit"
											class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
											title="Mark as no-show"
										>
											✗ No-show
										</button>
									</form>
									<form method="POST" action="?/resend" use:enhance>
										<input type="hidden" name="registration_id" value={registration.id} />
										<button
											type="submit"
											class="rounded px-2 py-1 text-xs text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30"
											title="Resend confirmation email"
										>
											📧
										</button>
									</form>
									<form method="POST" action="?/cancel" use:enhance>
										<input type="hidden" name="registration_id" value={registration.id} />
										<button
											type="submit"
											class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
											title="Cancel registration"
										>
											Cancel
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<!-- Waitlisted -->
{#if data.event.waitlistEnabled}
	<section class="mb-8">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
			Waitlist
			<span class="text-sm font-normal text-gray-500 dark:text-gray-400"
				>({data.waitlisted.length})</span
			>
		</h2>
		{#if data.waitlisted.length === 0}
			<p
				class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
			>
				No one on the waitlist.
			</p>
		{:else}
			<div
				class="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm dark:border-amber-800 dark:bg-gray-800"
			>
				<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead class="bg-amber-50 dark:bg-amber-900/30">
						<tr>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-amber-700 uppercase dark:text-amber-400"
								>Name</th
							>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-amber-700 uppercase dark:text-amber-400"
								>Email</th
							>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-amber-700 uppercase dark:text-amber-400"
								>Waitlisted</th
							>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-amber-700 uppercase dark:text-amber-400"
								>Note</th
							>
							<th
								class="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-amber-700 uppercase dark:text-amber-400"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
						{#each data.waitlisted as { registration } (registration.id)}
							<tr class="hover:bg-amber-50/50 dark:hover:bg-amber-900/20">
								<td class="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100"
									>{registration.nameSnapshot}</td
								>
								<td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400"
									>{registration.emailSnapshot}</td
								>
								<td class="px-4 py-2.5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
									>{formatDate(registration.createdAt)}</td
								>
								<td class="px-4 py-2.5 text-sm text-gray-400 italic dark:text-gray-500"
									>{registration.adminNote ?? ''}</td
								>
								<td class="px-4 py-2.5 text-right whitespace-nowrap">
									<div class="flex items-center justify-end gap-1">
										<form method="POST" action="?/promote" use:enhance>
											<input type="hidden" name="registration_id" value={registration.id} />
											<button
												type="submit"
												class="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
												title="Promote to registered"
											>
												⬆ Promote
											</button>
										</form>
										<form method="POST" action="?/resend" use:enhance>
											<input type="hidden" name="registration_id" value={registration.id} />
											<button
												type="submit"
												class="rounded px-2 py-1 text-xs text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30"
												title="Resend waitlist email"
											>
												📧
											</button>
										</form>
										<form method="POST" action="?/cancel" use:enhance>
											<input type="hidden" name="registration_id" value={registration.id} />
											<button
												type="submit"
												class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
												title="Remove from waitlist"
											>
												Remove
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
{/if}

<!-- Attended -->
{#if data.attended.length > 0}
	<section class="mb-8">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
			Attended
			<span class="text-sm font-normal text-gray-500 dark:text-gray-400"
				>({data.attended.length})</span
			>
		</h2>
		<div
			class="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm dark:border-blue-800 dark:bg-gray-800"
		>
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-blue-50 dark:bg-blue-900/30">
					<tr>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-blue-700 uppercase dark:text-blue-400"
							>Name</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-blue-700 uppercase dark:text-blue-400"
							>Email</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-blue-700 uppercase dark:text-blue-400"
							>Note</th
						>
						<th
							class="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-blue-700 uppercase dark:text-blue-400"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
					{#each data.attended as { registration } (registration.id)}
						<tr class="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
							<td class="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100"
								>{registration.nameSnapshot}</td
							>
							<td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400"
								>{registration.emailSnapshot}</td
							>
							<td class="px-4 py-2.5 text-sm text-gray-400 italic dark:text-gray-500"
								>{registration.adminNote ?? ''}</td
							>
							<td class="px-4 py-2.5 text-right whitespace-nowrap">
								<form method="POST" action="?/status" use:enhance>
									<input type="hidden" name="registration_id" value={registration.id} />
									<input type="hidden" name="status" value="registered" />
									<button
										type="submit"
										class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
										title="Revert to registered"
									>
										↩ Revert
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

<!-- No-shows -->
{#if data.noShow.length > 0}
	<section class="mb-8">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
			No-shows
			<span class="text-sm font-normal text-gray-500 dark:text-gray-400"
				>({data.noShow.length})</span
			>
		</h2>
		<div
			class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-700/50">
					<tr>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Name</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Email</th
						>
						<th
							class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Note</th
						>
						<th
							class="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
					{#each data.noShow as { registration } (registration.id)}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<td class="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100"
								>{registration.nameSnapshot}</td
							>
							<td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400"
								>{registration.emailSnapshot}</td
							>
							<td class="px-4 py-2.5 text-sm text-gray-400 italic dark:text-gray-500"
								>{registration.adminNote ?? ''}</td
							>
							<td class="px-4 py-2.5 text-right whitespace-nowrap">
								<form method="POST" action="?/status" use:enhance>
									<input type="hidden" name="registration_id" value={registration.id} />
									<input type="hidden" name="status" value="registered" />
									<button
										type="submit"
										class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
										title="Revert to registered"
									>
										↩ Revert
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

<!-- Cancelled (collapsible) -->
{#if data.cancelled.length > 0}
	<section class="mb-8">
		<button
			type="button"
			class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100"
			onclick={() => (showCancelled = !showCancelled)}
		>
			<span class="text-sm transition-transform {showCancelled ? 'rotate-90' : ''}">▶</span>
			Cancelled
			<span class="text-sm font-normal text-gray-500 dark:text-gray-400"
				>({data.cancelled.length})</span
			>
		</button>
		{#if showCancelled}
			<div
				class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead class="bg-gray-50 dark:bg-gray-700/50">
						<tr>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
								>Name</th
							>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
								>Email</th
							>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
								>Cancelled</th
							>
							<th
								class="px-4 py-2.5 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
								>Note</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
						{#each data.cancelled as { registration } (registration.id)}
							<tr class="opacity-60 hover:bg-gray-50 dark:hover:bg-gray-700/50">
								<td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300"
									>{registration.nameSnapshot}</td
								>
								<td class="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400"
									>{registration.emailSnapshot}</td
								>
								<td class="px-4 py-2.5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
									>{formatDate(registration.updatedAt)}</td
								>
								<td class="px-4 py-2.5 text-sm text-gray-400 italic dark:text-gray-500"
									>{registration.adminNote ?? ''}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
{/if}

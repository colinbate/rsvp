<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title
		>{data.event ? `RSVP: ${data.event.title}` : 'Event Not Found'} — Bermuda Triangle Society</title
	>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-12">
	{#if data.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
			<h1 class="mb-2 text-xl font-semibold text-red-800">Unable to RSVP</h1>
			<p class="text-red-700">{data.error}</p>
			{#if data.event?.canonicalUrl}
				<a
					href={data.event.canonicalUrl}
					rel="external"
					class="mt-4 inline-block text-sm text-purple-700 underline hover:text-purple-900"
				>
					&larr; Back to event page
				</a>
			{/if}
		</div>
	{:else if data.event}
		<div class="mb-8 text-center">
			<img src="/favicon.svg" alt="" class="mx-auto mb-4 h-10 w-10" />
			<h1 class="text-2xl font-bold text-gray-900">RSVP</h1>
			<p class="mt-1 text-lg text-purple-700">{data.event.title}</p>
			{#if data.event.location}
				<p class="mt-1 text-sm text-gray-500">{data.event.location}</p>
			{/if}
		</div>

		{#if form?.error}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-5">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					value={form?.name ?? ''}
					autocomplete="name"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					value={form?.email ?? ''}
					autocomplete="email"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
				/>
			</div>

			<!-- Honeypot field — hidden from real users -->
			<div class="absolute -left-2499 opacity-0" aria-hidden="true">
				<label for="phone">Phone</label>
				<input type="text" id="phone" name="phone" tabindex="-1" autocomplete="off" />
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
			>
				Register
			</button>
		</form>

		<p class="mt-6 text-center text-xs text-gray-500">
			Your name and email are used for event coordination and may be shared with the hosting library
			for attendance planning. This is separate from the Gaggle Mail discussion group.
		</p>

		{#if data.event.canonicalUrl}
			<p class="mt-4 text-center">
				<a
					href={data.event.canonicalUrl}
					rel="external"
					class="text-sm text-purple-700 underline hover:text-purple-900"
				>
					&larr; View full event details
				</a>
			</p>
		{/if}
	{/if}
</div>

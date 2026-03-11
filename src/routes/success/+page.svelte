<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const eventSlug = $derived(page.url.searchParams.get('event'));
	const status = $derived(page.url.searchParams.get('status') ?? 'registered');
	const isWaitlisted = $derived(status === 'waitlisted');
</script>

<svelte:head>
	<title>{isWaitlisted ? 'Waitlisted' : 'Registration Confirmed'} — Bermuda Triangle Society</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-12">
	<div class="mb-8 text-center">
		<img src="/favicon.svg" alt="" class="mx-auto mb-4 h-10 w-10" />
	</div>

	{#if isWaitlisted}
		<div class="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
			<div class="mb-4 text-4xl">📋</div>
			<h1 class="mb-2 text-2xl font-bold text-amber-800">You're on the waitlist</h1>
			<p class="text-amber-700">
				This event is currently at capacity, but you've been added to the waitlist. We'll email you
				immediately if a spot opens up!
			</p>
			<p class="mt-4 text-sm text-amber-600">
				Check your email for a confirmation with more details.
			</p>
		</div>
	{:else}
		<div class="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
			<div class="mb-4 text-4xl">🎉</div>
			<h1 class="mb-2 text-2xl font-bold text-green-800">You're registered!</h1>
			<p class="text-green-700">
				Your RSVP has been confirmed. We look forward to seeing you there!
			</p>
			<p class="mt-4 text-sm text-green-600">
				Check your email for a confirmation with event details and a cancellation link.
			</p>
		</div>
	{/if}

	{#if eventSlug}
		<p class="mt-6 text-center">
			<a
				href={resolve(`/rsvp/${eventSlug}`)}
				class="text-sm text-purple-700 underline hover:text-purple-900"
			>
				&larr; Back to event
			</a>
		</p>
	{/if}
</div>

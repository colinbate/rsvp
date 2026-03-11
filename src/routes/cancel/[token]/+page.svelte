<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const cancelled = $derived(form?.success || data.alreadyCancelled);
</script>

<svelte:head>
	<title>Cancel Registration — Bermuda Triangle Society</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-12">
	<div class="mb-8 text-center">
		<img src="/favicon.svg" alt="" class="mx-auto mb-4 h-10 w-10" />
		<h1 class="text-2xl font-bold text-gray-900">Cancel Registration</h1>
	</div>

	{#if cancelled}
		<div class="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
			<h2 class="mb-2 text-lg font-semibold text-green-800">Registration Cancelled</h2>
			{#if data.alreadyCancelled && !form?.success}
				<p class="text-green-700">This registration was already cancelled.</p>
			{:else}
				<p class="text-green-700">
					Your registration for <strong>{data.event.title}</strong> has been cancelled successfully.
				</p>
			{/if}
			{#if data.event.canonicalUrl}
				<a
					href={data.event.canonicalUrl}
					rel="external"
					class="mt-4 inline-block text-sm text-purple-700 underline hover:text-purple-900"
				>
					&larr; Back to event page
				</a>
			{/if}
		</div>
	{:else}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<p class="mb-4 text-gray-700">
				Are you sure you want to cancel your registration for the following event?
			</p>

			<div class="mb-6 rounded-lg bg-gray-50 p-4">
				<h3 class="font-semibold text-purple-700">{data.event.title}</h3>
				{#if data.event.startsAt}
					<p class="mt-1 text-sm text-gray-600">
						{new Date(data.event.startsAt).toLocaleDateString('en-US', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric',
							hour: 'numeric',
							minute: '2-digit'
						})}
					</p>
				{/if}
				{#if data.event.location}
					<p class="mt-1 text-sm text-gray-500">{data.event.location}</p>
				{/if}
			</div>

			<p class="mb-1 text-sm text-gray-500">
				Registered as: <strong class="text-gray-700">{data.registration.nameSnapshot}</strong>
			</p>
			{#if data.registration.status === 'waitlisted'}
				<p class="mb-4 text-sm text-amber-600">You are currently on the waitlist for this event.</p>
			{/if}

			<form method="POST" use:enhance class="mt-6 flex items-center gap-3">
				<button
					type="submit"
					class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
				>
					Yes, cancel my registration
				</button>
				{#if data.event.canonicalUrl}
					<a
						href={data.event.canonicalUrl}
						rel="external"
						class="text-sm text-gray-500 hover:text-gray-700"
					>
						Never mind
					</a>
				{/if}
			</form>
		</div>
	{/if}
</div>

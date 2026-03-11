<script lang="ts">
	import EventForm from '$lib/components/EventForm.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>New Event — BTS Admin</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Event</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Set up a new event to accept RSVPs.</p>
	</div>

	<div
		class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<EventForm event={form ?? {}} error={form?.error ?? null} />
	</div>
</div>

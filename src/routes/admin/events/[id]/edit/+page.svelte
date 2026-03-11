<script lang="ts">
	import EventForm from '$lib/components/EventForm.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data, form } = $props();

	// When form validation fails, merge the submitted values back so the user
	// sees what they typed. We cast through `unknown` because the form union
	// type doesn't directly overlap with EventData.
	const event: PageData['event'] = $derived(
		form && 'title' in form
			? ({ ...data.event, ...form } as unknown as PageData['event'])
			: data.event
	);
</script>

<svelte:head>
	<title>Edit: {data.event.title} — BTS Admin</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<div class="mb-6">
		<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
			<a href={resolve('/admin')} class="hover:text-purple-700 dark:hover:text-purple-400"
				>Dashboard</a
			>
			<span>&rsaquo;</span>
			<a
				href={resolve(`/admin/events/${data.event.id}`)}
				class="hover:text-purple-700 dark:hover:text-purple-400">{data.event.title}</a
			>
			<span>&rsaquo;</span>
			<span class="text-gray-700 dark:text-gray-300">Edit</span>
		</div>
		<h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Event</h1>
	</div>

	<div
		class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<EventForm {event} error={form?.error ?? null} isEdit />
	</div>
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import ModeSwitcher from '$lib/components/ModeSwitcher.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<title>Admin — Bermuda Triangle Society RSVP</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
	<!-- Top header bar -->
	<header
		class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="flex items-center gap-2">
			<a href={resolve('/admin')} class="flex items-center gap-2">
				<img src="/favicon.svg" alt="" class="h-6 w-6" />
				<span class="text-sm font-semibold text-gray-900 dark:text-gray-100">RSVP Admin</span>
			</a>
		</div>
		<div class="flex items-center gap-4">
			{#if globalThis.Temporal}
				<span class="text-xs text-transparent hover:text-gray-500 dark:hover:text-gray-400"
					>{globalThis.Temporal.Now.zonedDateTimeISO().toString()}</span
				>
			{/if}
			{#if data.user}
				<span class="text-xs text-gray-500 dark:text-gray-400">{data.user}</span>
			{/if}
			<ModeSwitcher />
			<a
				href={resolve('/')}
				class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
			>
				&larr; Back to site
			</a>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto p-6 lg:p-8">
		{@render children()}
	</main>
</div>

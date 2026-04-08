<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import ModeSwitcher from '$lib/components/ModeSwitcher.svelte';

	let { children } = $props();

	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
	{#if !isAdmin}
		<div class="fixed top-3 right-3 z-50">
			<ModeSwitcher />
		</div>
	{/if}
	{@render children()}
</div>

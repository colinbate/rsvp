<script lang="ts">
	import './layout.css';
	import ModeSwitcher from '$lib/components/ModeSwitcher.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
	<div class="fixed top-3 right-3 z-50">
		<ModeSwitcher />
	</div>
	{@render children()}
</div>

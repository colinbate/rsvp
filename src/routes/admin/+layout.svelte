<script lang="ts">
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<title>Admin — Bermuda Triangle Society RSVP</title>
</svelte:head>

<div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Sidebar -->
	<nav
		class="flex w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="flex items-center gap-2 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
			<img src="/favicon.svg" alt="" class="h-6 w-6" />
			<span class="text-sm font-semibold text-gray-900 dark:text-gray-100">BTS Admin</span>
		</div>
		<ul class="flex-1 space-y-1 p-3">
			<li>
				<a
					href={resolve('/admin')}
					class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
				>
					Dashboard
				</a>
			</li>
			<li>
				<a
					href={resolve('/admin/events')}
					class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
				>
					Events
				</a>
			</li>
			<li>
				<a
					href={resolve('/admin/events/new')}
					class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
				>
					+ New Event
				</a>
			</li>
		</ul>
		<div class="border-t border-gray-200 p-3 dark:border-gray-700">
			<a
				href={resolve('/')}
				class="block rounded-md px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
			>
				&larr; Back to site
			</a>
		</div>
	</nav>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto p-6 lg:p-8">
		{@render children()}
	</main>
</div>

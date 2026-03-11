<script lang="ts">
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<title>Admin — Bermuda Triangle Society RSVP</title>
</svelte:head>

<div class="flex min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<nav class="flex w-56 flex-col border-r border-gray-200 bg-white">
		<div class="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
			<img src="/favicon.svg" alt="" class="h-6 w-6" />
			<span class="text-sm font-semibold text-gray-900">BTS Admin</span>
		</div>
		<ul class="flex-1 space-y-1 p-3">
			<li>
				<a
					href={resolve('/admin')}
					class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
				>
					Dashboard
				</a>
			</li>
			<li>
				<a
					href={resolve('/admin/events')}
					class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
				>
					Events
				</a>
			</li>
			<li>
				<a
					href={resolve('/admin/events/new')}
					class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
				>
					+ New Event
				</a>
			</li>
		</ul>
		<div class="border-t border-gray-200 p-3">
			<a
				href={resolve('/')}
				class="block rounded-md px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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

<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Bermuda Triangle Society — RSVP</title>
	<meta name="description" content="RSVP system for Bermuda Triangle Society events." />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
	<div class="text-center">
		<img src="/favicon.svg" alt="" class="mx-auto mb-6 h-16 w-16" />
		<h1 class="text-3xl font-bold text-gray-900">Bermuda Triangle Society</h1>
		<p class="mt-2 text-lg text-purple-700">Event RSVP System</p>
		<p class="mt-4 max-w-md text-sm text-gray-500">
			This is the RSVP service for Bermuda Triangle Society events. Visit an event page on the main
			site to register for upcoming events.
		</p>
		<div class="mt-8">
			<a
				href={resolve(`/admin`)}
				class="rounded-md bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
			>
				Admin Dashboard
			</a>
		</div>
	</div>
</div>

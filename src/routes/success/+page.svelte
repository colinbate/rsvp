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
		<div
			class="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-700 dark:bg-amber-900/30"
		>
			<div class="mx-auto mb-4 size-9">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"
					><path
						d="M439.4 96L448 96C483.3 96 512 124.7 512 160L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 160C128 124.7 156.7 96 192 96L200.6 96C211.6 76.9 232.3 64 256 64L384 64C407.7 64 428.4 76.9 439.4 96zM376 176C389.3 176 400 165.3 400 152C400 138.7 389.3 128 376 128L264 128C250.7 128 240 138.7 240 152C240 165.3 250.7 176 264 176L376 176zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM288 320C288 333.3 298.7 344 312 344L424 344C437.3 344 448 333.3 448 320C448 306.7 437.3 296 424 296L312 296C298.7 296 288 306.7 288 320zM288 448C288 461.3 298.7 472 312 472L424 472C437.3 472 448 461.3 448 448C448 434.7 437.3 424 424 424L312 424C298.7 424 288 434.7 288 448zM224 480C241.7 480 256 465.7 256 448C256 430.3 241.7 416 224 416C206.3 416 192 430.3 192 448C192 465.7 206.3 480 224 480z"
					/></svg
				>
			</div>
			<h1 class="mb-2 text-2xl font-bold text-amber-800 dark:text-amber-300">
				You're on the waitlist
			</h1>
			<p class="text-amber-700 dark:text-amber-400">
				This event is currently at capacity, but you've been added to the waitlist. We'll email you
				immediately if a spot opens up!
			</p>
			<p class="mt-4 text-sm text-amber-600 dark:text-amber-500">
				Check your email for a confirmation with more details.
			</p>
		</div>
	{:else}
		<div
			class="rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-700 dark:bg-green-900/30"
		>
			<div class="mx-auto mb-4 size-9">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"
					><path
						d="M96 96C96 78.3 110.3 64 128 64C145.7 64 160 78.3 160 96C160 113.7 145.7 128 128 128C110.3 128 96 113.7 96 96zM512 224C512 206.3 526.3 192 544 192C561.7 192 576 206.3 576 224C576 241.7 561.7 256 544 256C526.3 256 512 241.7 512 224zM544 480C561.7 480 576 494.3 576 512C576 529.7 561.7 544 544 544C526.3 544 512 529.7 512 512C512 494.3 526.3 480 544 480zM231 217C221.6 207.6 221.6 192.4 231 183.1L239.3 174.8C256 158.1 266.5 136.2 269.1 112.7L272.1 85.3C273.6 72.2 285.5 62.7 298.7 64.1C311.9 65.5 321.4 77.4 319.9 90.6L316.9 118C313.1 152.3 297.7 184.3 273.3 208.7L265 217C255.6 226.4 240.4 226.4 231.1 217zM423 375L431.2 366.8C455.6 342.4 487.6 327 521.9 323.2L549.3 320.2C562.5 318.7 574.3 328.2 575.8 341.4C577.3 354.6 567.8 366.4 554.6 367.9L527.2 370.9C503.7 373.5 481.8 384 465.1 400.7L457 409C447.6 418.4 432.4 418.4 423.1 409C413.8 399.6 413.7 384.4 423.1 375.1zM570.3 72.5C578.9 82.6 577.6 97.8 567.5 106.3L557.5 114.8C542.7 127.3 523.8 133.9 504.5 133.4C487.9 133 473.9 145.8 472.9 162.4L471.1 192.4C468.6 234.9 432.8 267.7 390.3 266.6C382.7 266.4 375.3 269 369.6 273.9L359.6 282.4C349.5 291 334.3 289.7 325.8 279.6C317.3 269.5 318.5 254.3 328.6 245.8L338.6 237.3C353.4 224.8 372.3 218.2 391.6 218.7C408.2 219.1 422.2 206.3 423.2 189.7L425 159.7C427.5 117.2 463.3 84.4 505.8 85.5C513.4 85.7 520.8 83.1 526.5 78.2L536.5 69.7C546.6 61.1 561.8 62.4 570.3 72.5zM214.6 265.4L374.6 425.4C382.3 433.1 385.6 444.2 383.2 454.8C380.8 465.4 373.3 474.2 363.2 478L323.5 492.9L147.1 316.5L162 276.8C165.8 266.6 174.6 259.1 185.2 256.8C195.8 254.5 206.9 257.8 214.6 265.4zM112.2 409.6L134.8 349.4L290.6 505.2L230.4 527.8L112.2 409.6zM99.9 442.5L197.5 540.1L107.2 573.9C95.5 578.3 82.2 575.4 73.3 566.6C64.4 557.8 61.6 544.5 66 532.8L99.8 442.5z"
					/></svg
				>
			</div>
			<h1 class="mb-2 text-2xl font-bold text-green-800 dark:text-green-300">You're registered!</h1>
			<p class="text-green-700 dark:text-green-400">
				Your RSVP has been confirmed. We look forward to seeing you there!
			</p>
			<p class="mt-4 text-sm text-green-600 dark:text-green-500">
				Check your email for a confirmation with event details and a cancellation link.
			</p>
		</div>
	{/if}

	{#if eventSlug}
		<p class="mt-6 text-center">
			<a
				href={resolve(`/rsvp/${eventSlug}`)}
				class="text-sm text-purple-700 underline hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
			>
				&larr; Back to event
			</a>
		</p>
	{/if}
</div>

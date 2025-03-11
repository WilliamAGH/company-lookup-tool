<script>
	// Home page
</script>

<svelte:head>
	<title>Company Research Tools - Experimental</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold">Company Research Tools - Experimental</h1>
		<p class="mx-auto max-w-2xl text-xl text-gray-600">
			Explore companies and their related resources in a research database.
		</p>
	</div>

	<div class="mx-auto max-w-2xl">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<a
				href="/companies"
				class="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mb-4 h-12 w-12 text-blue-500"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
						clip-rule="evenodd"
					/>
				</svg>
				<h2 class="mb-2 text-xl font-semibold">Browse Companies</h2>
				<p class="text-gray-600">
					Explore companies and their related resources in a research database
				</p>
			</a>

			<a
				href="/newcompanylookup"
				class="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
						<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
					</svg>
				</div>
				<h2 class="mb-2 text-xl font-semibold transition group-hover:text-green-600">
					Company Lookup
				</h2>
				<p class="text-gray-600">
					Lookup information about companies in an new experimental AI tool.
				</p>
				<div
					class="mt-2 flex items-center text-green-600 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<span class="mr-1">Search now</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</div>
			</a>
		</div>
	</div>
</div>

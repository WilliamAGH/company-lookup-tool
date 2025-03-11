<!-- Companies index page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getImageUrl, handleImageError } from '$lib/utils/imagesS3.client';

	// Type for company data
	interface Company {
		id: string;
		nameLegal: string | null;
		nameBrand: string | null;
		slug: string | null;
		fileLogoSquare: string | null;
		statusOperating: string;
		dateYearEstablished: number | null;
	}

	let companies: Company[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			// Note: This is a placeholder. In a real implementation,
			// you would need an API endpoint to list all companies
			// For now, we'll use setTimeout to simulate a network request
			setTimeout(() => {
				loading = false;
				// This would be replaced with actual data from an API call
				companies = [];
			}, 1000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Companies | Experimental Tool</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">Companies</h1>

	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<p class="text-xl">Loading companies...</p>
		</div>
	{:else if error}
		<div class="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
			<p class="font-bold">Error</p>
			<p>{error}</p>
		</div>
	{:else if companies.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each companies as company}
				<a
					href="/companies/{company.slug}"
					class="block rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex items-center gap-4">
						{#if company.fileLogoSquare}
							<div class="h-12 w-12 flex-shrink-0">
								<img
									src={getImageUrl(company.fileLogoSquare)}
									alt="{company.nameBrand || company.nameLegal} logo"
									class="h-full w-full object-contain"
									on:error={(e) => handleImageError(e, 'COMPANY_LOGO')}
								/>
							</div>
						{/if}
						<div>
							<h2 class="text-lg font-semibold">{company.nameBrand || company.nameLegal}</h2>
							{#if company.statusOperating}
								<span class="mt-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
									{company.statusOperating}
								</span>
							{/if}
							{#if company.dateYearEstablished}
								<span
									class="mt-1 ml-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-800"
								>
									Est. {company.dateYearEstablished}
								</span>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class="mb-6 rounded border border-gray-300 bg-gray-100 px-4 py-8 text-center text-gray-700"
		>
			<p class="mb-2 text-xl font-medium">No companies available</p>
			<p>There are currently no companies in the database to display.</p>
		</div>
	{/if}

	<!-- Back to home link -->
	<div class="mt-8">
		<a href="/" class="flex items-center text-blue-500 hover:underline">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
					clip-rule="evenodd"
				/>
			</svg>
			Back to homepage
		</a>
	</div>
</div>

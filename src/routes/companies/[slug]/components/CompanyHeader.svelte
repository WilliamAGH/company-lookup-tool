<!-- 
  CLIENT-SIDE COMPONENT
  
  This component renders the header section of a company detail page,
  including the logo, name, and status tags.
  
  Uses the S3 image handling system:
  - @link src/lib/utils/imagesS3.client.ts - For image URL generation and error handling
-->
<script lang="ts">
	import { getImageUrl, handleImageError } from '$lib/utils/imagesS3.client';

	// Props - company data passed from the parent
	export let company: any;
</script>

<!-- Company header with logo -->
<div class="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
	{#if company.fileLogoSquare}
		<div class="h-24 w-24 flex-shrink-0">
			<img
				src={getImageUrl(company.fileLogoSquare)}
				alt="{company.nameBrand || company.nameLegal} logo"
				class="h-full w-full rounded-lg border border-gray-200 object-contain shadow-sm"
				on:error={(e) => handleImageError(e)}
			/>
		</div>
	{/if}

	<div>
		<h1 class="mb-2 text-3xl font-bold">{company.nameBrand || company.nameLegal}</h1>
		{#if company.nameLegal && company.nameBrand && company.nameLegal !== company.nameBrand}
			<h2 class="mb-4 text-xl text-gray-600">{company.nameLegal}</h2>
		{/if}

		<div class="mb-4 flex flex-wrap gap-2">
			{#if company.statusOperating}
				<span class="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800">
					Status: {company.statusOperating}
				</span>
			{/if}
			{#if company.dateYearEstablished}
				<span class="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800">
					Est. {company.dateYearEstablished}
				</span>
			{/if}
			{#if company.functionalCurrency}
				<span class="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800">
					Currency: {company.functionalCurrency}
				</span>
			{/if}
			{#if company.statusVerified}
				<span class="flex items-center rounded bg-green-100 px-2 py-1 text-sm text-green-800">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Verified
				</span>
			{/if}
		</div>
	</div>
</div>

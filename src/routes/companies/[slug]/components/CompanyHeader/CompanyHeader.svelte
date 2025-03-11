<!-- 
  CompanyHeader.svelte
  
  This component renders the header section of the company detail page,
  including the logo, name, tagline, and external links.
  
  Features:
  - Hero section with company branding
  - Logo and name layout
  - Tagline and description
  - External links (Website, GitHub, LinkedIn, etc.)
-->
<script lang="ts">
	import { getImageUrl, handleImageError } from '$lib/utils/imagesS3.client';
	import type { EnhancedCompanyData } from '../../types';
	import CompanyExternalLinks from './CompanyExternalLinks.svelte';
	import CompanyKeyMetrics from './CompanyKeyMetrics.svelte';
	import { onMount } from 'svelte';
	import { debugLog } from '$lib/utils/debug.client';

	// Props - company data passed from the parent
	export let company: EnhancedCompanyData;

	onMount(() => {
		// Debug the company data with proper deep object logging
		debugLog('Company data in CompanyHeader component', {
			company,
			name: company.name,
			logoUrl: company.logoUrl,
			// Additional fields to debug
			allImageFields: {
				logoUrl: company.logoUrl,
				faviconUrl: company.faviconUrl
			}
		});
	});
</script>

<div class="mb-8">
	<!-- Company header with logo and name -->
	<div class="mb-6 flex flex-col items-center gap-6 md:flex-row md:items-start">
		<div class="h-28 w-28 flex-shrink-0">
			<!-- 
				IMPORTANT: The logoUrl field comes directly from the API.
				It's a relative path like "/logos/eqc/EQcesTGfwOmm-6VMYcW96mw.jpeg"
				The getImageUrl() function turns this into a full URL using PUBLIC_IMAGE_BASE_URL.
			-->
			<img
				src={getImageUrl(company.logoUrl, { placeholder: 'COMPANY_LOGO' })}
				alt="{company.name || company.nameLegal} logo"
				class="h-full w-full rounded-lg border border-gray-200 object-contain p-1 shadow-sm"
				on:error={(e) => handleImageError(e, 'COMPANY_LOGO')}
			/>
		</div>

		<div class="text-center md:text-left">
			<h1 class="mb-2 text-3xl font-bold">{company.name || company.nameLegal}</h1>

			{#if company.nameLegal && company.name && company.nameLegal !== company.name}
				<h2 class="mb-2 text-xl text-gray-600">{company.nameLegal}</h2>
			{/if}

			{#if company.description}
				<p class="mb-4 text-gray-600">{company.description}</p>
			{:else}
				<p class="mb-4 text-gray-600">Moving the way the world moves</p>
			{/if}

			<!-- External links -->
			<CompanyExternalLinks {company} />
		</div>
	</div>

	<!-- Key metrics cards -->
	<CompanyKeyMetrics {company} />
</div>

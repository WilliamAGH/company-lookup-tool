<!-- 
  CLIENT-SIDE CODE
  
  This file contains the client-side UI component for the company detail page.
  It receives data from the server-side load function and renders the UI.
  
  The page uses our S3 image handling system for company logos and favicons:
  - @link src/lib/utils/imagesS3.client.ts - For client-side image URL generation
  - @link src/lib/utils/imagesS3.server.ts - For the server-side image handling
  - @link src/lib/utils/favicon.client.ts - For favicon handling utilities
  - @link src/lib/constants/placeholders.ts - For placeholder definitions
  
  All rendering logic, conditional display, and image handling happens client-side.
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';
	import type { PageData } from './$types';
	import { debugLog } from '$lib/utils/debug.client';
	import CompanyHeader from './components/CompanyHeader/CompanyHeader.svelte';
	import TabNavigation from './components/TabNavigation/TabNavigation.svelte';
	import NotFoundAlert from './components/NotFoundAlert.svelte';
	import { loadCompanyFavicon, restoreDefaultFavicon } from '$lib/utils/favicon.client';

	// Import tab content components
	import Overview from './components/Overview/Overview.svelte';
	import Financials from './components/Financials/Financials.svelte';
	import Products from './components/Products/Products.svelte';
	import Analysis from './components/Analysis/Analysis.svelte';
	import News from './components/News/News.svelte';
	import FAQ from './components/FAQ/FAQ.svelte';

	export let data: PageData;
	const { company, activeTab } = data;

	// Reactive variable to track the current tab
	let currentTab = activeTab || 'overview';

	// Track navigation event listener for cleanup
	let popStateListener: (() => void) | null = null;

	// Debug the API response data with proper deep object logging
	debugLog('API response data on company page', {
		company,
		imageFields: {
			logoUrl: company.logoUrl
		},
		environment: {
			PUBLIC_IMAGE_BASE_URL: env.PUBLIC_IMAGE_BASE_URL
		}
	});

	onMount(() => {
		// Load company favicon from S3
		const s3BaseUrl = env.PUBLIC_IMAGE_BASE_URL || '';
		loadCompanyFavicon(company, s3BaseUrl);

		// Listen for back/forward navigation events
		popStateListener = () => {
			// Get tab from URL when navigating with browser buttons
			const url = new URL(window.location.href);
			const tabFromUrl = url.searchParams.get('tab') || 'overview';
			currentTab = tabFromUrl;
		};

		window.addEventListener('popstate', popStateListener);
	});

	// Clean up event listeners and restore default favicon when component is destroyed
	onDestroy(() => {
		// Remove event listener
		if (popStateListener) {
			window.removeEventListener('popstate', popStateListener);
		}
	});

	// Handle tab change
	function handleTabChange(tab: string) {
		currentTab = tab;
		// Update the URL with the new tab
		const url = new URL(window.location.href);
		url.searchParams.set('tab', tab);
		window.history.pushState({}, '', url);
	}
</script>

<svelte:head>
	<title>{company ? `${company.name} | Lookup Tool` : 'Company Not Found'}</title>
	<!-- Default favicons - will be overridden by JavaScript when company logo loads successfully -->
	<!-- Comprehensive diagnostic logging is enabled for all image loading paths -->
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a
			href="/companies"
			class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
		>
			<svg
				class="mr-1 h-5 w-5 text-gray-400"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
			Back to Companies
		</a>
	</div>

	{#if company}
		<CompanyHeader {company} />

		<div class="mt-8">
			<TabNavigation activeTab={currentTab} onTabChange={handleTabChange} />

			<div class="mt-6">
				{#if currentTab === 'overview'}
					<Overview {company} />
				{:else if currentTab === 'financials'}
					<Financials {company} />
				{:else if currentTab === 'products'}
					<Products {company} />
				{:else if currentTab === 'analysis'}
					<Analysis {company} />
				{:else if currentTab === 'news'}
					<News {company} />
				{:else if currentTab === 'faq'}
					<FAQ {company} />
				{/if}
			</div>
		</div>
	{:else}
		<NotFoundAlert />
	{/if}
</div>

<script lang="ts">
	/**
	 * Company Competitive Analysis Lookup Page
	 *
	 * Provides a UI for testing the OpenAI-powered competitive analysis functionality.
	 * Uses centralized data processing tools and API utilities to maintain DRY principles.
	 *
	 * @module src/routes/newcompanylookup
	 * @link data-tools/sharedUtils/dataProcessing.ts - Central data transformation functions
	 * @link src/lib/server/db/research/schema/index.ts - Source of truth for data schemas
	 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - API endpoint
	 * @link src/lib/types/openaiApi.d.ts - OpenAI API types including response formats
	 * @link src/lib/utils/openaiApi.ts - OpenAI utility functions
	 */
	import { onMount } from 'svelte';
	import type { EnhancedCompanyData } from '../../routes/companies/[slug]/types';
	import OpenAIResponseTable from './components/OpenAIResponseTable.svelte';
	import ChromeStyleJsonViewer from './components/ChromeStyleJsonViewer.svelte';
	import {
		transformToEnhancedCompanyData,
		createMockAnalysisData
	} from '$data-tools/sharedUtils/dataProcessing';
	import type { AnalysisData } from '$lib/server/db/research/schema';
	import type { ApiResponse, ApiCost } from '$lib/types/openaiApi';
	import { extractApiCost } from '$lib/utils/openaiApi';

	// ===== UI Formatting Utilities =====

	/**
	 * Format any JSON-serializable value as a pretty-printed string
	 * Used for displaying raw JSON data in the UI
	 *
	 * @param data Any data that can be serialized to JSON
	 * @returns Formatted JSON string or empty string for null/undefined
	 */
	function formatJSON(data: unknown): string {
		if (data === null || data === undefined) {
			return '';
		}
		return JSON.stringify(data, null, 2);
	}

	/**
	 * Get the appropriate CSS class for an impact level indicator
	 * Used for styling SWOT analysis elements and future scenarios
	 *
	 * @param impact Impact level string ('high', 'medium', 'low')
	 * @returns CSS class string for the impact level
	 */
	function getImpactColor(impact: string): string {
		switch (impact) {
			case 'high':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'low':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
		}
	}

	/**
	 * Calculate percentage width for force value bars (e.g., Porter's Five Forces)
	 * Used to visualize numeric ratings as percentage bars
	 *
	 * @param value Numeric value (typically 0-5)
	 * @returns CSS width value as percentage string
	 */
	function getForceValue(value: number): string {
		// Calculate percentage for bar width
		return `${(value / 5) * 100}%`;
	}

	/**
	 * Get appropriate color class based on probability value
	 * Used for styling probability indicators in future scenarios
	 *
	 * @param probability Probability value between 0-1
	 * @returns CSS class string for the probability
	 */
	function getProbabilityColor(probability: number): string {
		if (probability >= 0.7) return 'bg-green-500';
		if (probability >= 0.4) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	// ===== Business Logic & API Integration =====

	/**
	 * Consolidated result from company analysis operations
	 * Represents all data needed for the UI, regardless of source (API or mock)
	 */
	interface CompanyAnalysisResult {
		rawResponse: ApiResponse<AnalysisData> | null;
		enhancedData: EnhancedCompanyData | null;
		apiCost: ApiCost | null;
		error: string | null;
	}

	/**
	 * Fetch company analysis data from the API
	 *
	 * This function mirrors the functionality in the centralized API endpoint
	 * but is designed specifically for UI usage with appropriate typing and
	 * enhanced data transformation.
	 *
	 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - Server API endpoint
	 * @link data-tools/openai.ts - Underlying OpenAI processing
	 *
	 * @param companyName Name of the company to analyze
	 * @returns Promise with analysis result
	 */
	async function fetchCompanyAnalysis(companyName: string): Promise<CompanyAnalysisResult> {
		if (!companyName.trim()) {
			return {
				rawResponse: null,
				enhancedData: null,
				apiCost: null,
				error: 'Company name is required'
			};
		}

		try {
			// Call the centralized API endpoint
			const response = await fetch(
				`/api/rest/v1/company/competitive-analysis?name=${encodeURIComponent(companyName)}`
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}

			// Get the data from the API
			const data = await response.json();
			console.log('API response:', data);

			// Use typed API response
			const rawResponse = data as ApiResponse<AnalysisData>;

			// Extract API cost
			const apiCost = extractApiCost(data);

			// Log cost info for UI debugging
			if (apiCost) {
				console.log(
					`API cost: $${apiCost.costUSD.toFixed(6)} (${apiCost.totalTokens.toLocaleString()} tokens)`
				);
			}

			// Process the data using the central utilities
			const analysisData = (data.data || data) as AnalysisData;
			const enhancedData = transformToEnhancedCompanyData(analysisData, companyName);

			return {
				rawResponse,
				enhancedData,
				apiCost,
				error: null
			};
		} catch (err) {
			console.error('Error fetching company data:', err);
			const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

			return {
				rawResponse: null,
				enhancedData: null,
				apiCost: null,
				error: errorMessage
			};
		}
	}

	/**
	 * Generate mock analysis data for testing without API calls
	 * Uses the centralized data generation utilities for consistency
	 *
	 * @link data-tools/sharedUtils/dataProcessing.ts - Source of central mock data generation
	 *
	 * @param companyName Name of the company to generate mock data for
	 * @returns Mock analysis result with standardized format
	 */
	function generateMockAnalysis(companyName: string): CompanyAnalysisResult {
		const usedCompanyName = companyName.trim() || 'Example Corp';

		// Use the centralized mock data generator
		const mockData = createMockAnalysisData(usedCompanyName);

		// Create a properly typed API response with cost metadata
		const rawResponse: ApiResponse<AnalysisData> = {
			success: true,
			data: mockData,
			_meta: {
				cost: {
					totalTokens: 1324,
					costUSD: 0.01324
				}
			}
		};

		// Use the central transformation function
		const enhancedData = transformToEnhancedCompanyData(mockData, usedCompanyName);

		return {
			rawResponse,
			enhancedData,
			apiCost: rawResponse._meta?.cost || null,
			error: null
		};
	}

	// ===== Component State =====
	let companyName = '';
	let isLoading = false;
	let rawJsonResponse: ApiResponse<AnalysisData> | null = null;
	let jsonResponse: EnhancedCompanyData | null = null;
	let error: string | null = null;
	let showFullJSON = false;
	let apiCallStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
	let activeTab: 'processed' | 'raw' = 'processed';
	let apiCost: ApiCost | null = null;

	// ===== UI Event Handlers =====

	/**
	 * Switch between processed and raw data tabs
	 * Simple UI state management for tab visibility
	 *
	 * @param tab The tab to display: 'processed' or 'raw'
	 */
	function switchTab(tab: 'processed' | 'raw') {
		activeTab = tab;
	}

	/**
	 * Handle analysis result data
	 * Updates component state based on the analysis result
	 * Pure UI state management function
	 *
	 * @param result The company analysis result
	 */
	function handleAnalysisResult(result: CompanyAnalysisResult): void {
		rawJsonResponse = result.rawResponse;
		jsonResponse = result.enhancedData;
		apiCost = result.apiCost;
		error = result.error;

		apiCallStatus = error ? 'error' : jsonResponse ? 'success' : 'idle';
	}

	/**
	 * Fetch company analysis data from the API
	 * UI entry point for the data fetching flow
	 *
	 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - API implementation
	 * @link data-tools/openai.ts - processCompanyAnalysis function
	 */
	async function fetchCompanyData() {
		if (!companyName.trim()) {
			error = 'Please enter a company name';
			return;
		}

		// Reset state
		error = null;
		isLoading = true;
		apiCallStatus = 'loading';
		jsonResponse = null;
		rawJsonResponse = null;
		apiCost = null;

		try {
			// Use the service to fetch and process data
			const result = await fetchCompanyAnalysis(companyName);
			handleAnalysisResult(result);
		} catch (err) {
			console.error('Unexpected error:', err);
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
			apiCallStatus = 'error';
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Generate mock data for testing without API calls
	 * Uses the centralized data generation utilities for consistency
	 *
	 * @link data-tools/sharedUtils/dataProcessing.ts - createMockAnalysisData function
	 */
	function generateMockData() {
		// Reset loading state
		isLoading = false;

		// Generate mock data using our central function
		const result = generateMockAnalysis(companyName);
		handleAnalysisResult(result);
	}

	/**
	 * Toggle visibility of the full JSON response data
	 * Simple UI state management function
	 */
	function toggleJSON() {
		showFullJSON = !showFullJSON;
	}
</script>

<svelte:head>
	<title>Company Lookup Tool</title>
	<meta
		name="description"
		content="Test the AI LLM competitive analysis with a company name lookup"
	/>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header with search bar on the right -->
	<div
		class="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
	>
		<div>
			<h1 class="text-3xl font-bold">Company Competitive Analysis Tool</h1>
			<p class="text-gray-600 dark:text-gray-300">
				Test the AI model's competitive analysis capabilities
			</p>
		</div>

		<div class="w-full md:w-auto">
			<form
				on:submit|preventDefault={() => {
					fetchCompanyData();
				}}
				class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2"
			>
				<div class="flex-grow">
					<input
						type="text"
						id="companyName"
						bind:value={companyName}
						placeholder="Enter company name"
						class="w-full rounded-md border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
						aria-label="Company name"
					/>
				</div>
				<div class="flex space-x-2">
					<button
						type="submit"
						class="focus:ring-opacity-50 rounded-md bg-blue-600 px-4 py-2 font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading}
					>
						{#if isLoading}
							<span class="inline-block animate-pulse">Analyzing...</span>
						{:else}
							Generate
						{/if}
					</button>
					<button
						type="button"
						on:click|preventDefault={generateMockData}
						class="focus:ring-opacity-50 rounded-md bg-gray-600 px-4 py-2 font-medium whitespace-nowrap text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading}
					>
						Use Mock Data
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- API Status -->
	{#if apiCallStatus !== 'idle'}
		<div class="mb-4 rounded bg-gray-100 p-2 text-sm dark:bg-gray-800">
			<div class="flex flex-col md:flex-row md:justify-between">
				<p>
					<span class="font-bold">API Status:</span>
					{apiCallStatus}
					{#if jsonResponse?.name && apiCallStatus === 'success'}
						| Data received for: {jsonResponse.name}
					{/if}
				</p>
				{#if apiCost}
					<p class="mt-1 md:mt-0">
						<span class="font-bold">API Cost:</span>
						<span class="ml-1 text-green-700 dark:text-green-400">
							${apiCost.costUSD.toFixed(6)}
						</span>
						<span class="ml-1 text-gray-500 dark:text-gray-400">
							({apiCost.totalTokens.toLocaleString()} tokens)
						</span>
					</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Error message display -->
	{#if error}
		<div
			class="mb-4 rounded border-l-4 border-red-500 bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-200"
		>
			<p>{error}</p>
		</div>
	{/if}

	{#if isLoading}
		<div
			class="flex h-64 items-center justify-center rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
		>
			<div class="flex flex-col items-center space-y-4">
				<div
					class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"
				></div>
				<p class="text-gray-500 dark:text-gray-400">Generating competitive analysis...</p>
			</div>
		</div>
	{:else if jsonResponse}
		<div id="company-analysis-results">
			<!-- Company Overview -->
			<div class="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
				<div
					class="flex flex-col items-start justify-between space-y-4 border-b border-gray-200 pb-4 md:flex-row md:items-center md:space-y-0 dark:border-gray-700"
				>
					<div>
						<h2 class="text-2xl font-bold">{jsonResponse.name || 'Unknown Company'}</h2>
						<p class="mt-1 text-lg text-gray-600 dark:text-gray-300">
							{jsonResponse.industry || 'Unknown Industry'} | {jsonResponse.sector ||
								'Unknown Sector'}
						</p>
					</div>
					<div>
						<button
							on:click={toggleJSON}
							class="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						>
							{showFullJSON ? 'Hide' : 'Show'} JSON
						</button>
					</div>
				</div>
				<p class="mt-4 text-gray-700 dark:text-gray-300">
					{jsonResponse.description || 'No description available'}
				</p>
			</div>

			<!-- JSON Viewer (collapsible) -->
			{#if showFullJSON}
				<div class="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-xl font-semibold">API Response Data</h2>
						{#if apiCost}
							<div class="text-sm">
								<span class="font-semibold">OpenAI API:</span>
								<span class="ml-1 text-green-700 dark:text-green-400"
									>${apiCost.costUSD.toFixed(6)}</span
								>
								<span class="ml-1 text-gray-500 dark:text-gray-400"
									>({apiCost.totalTokens.toLocaleString()} tokens)</span
								>
							</div>
						{/if}
					</div>

					<!-- Tabs for raw vs processed data -->
					<div class="mb-4 border-b border-gray-200 dark:border-gray-700">
						<ul class="-mb-px flex flex-wrap" role="tablist">
							<li class="mr-2" role="presentation">
								<button
									class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'processed'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
									type="button"
									role="tab"
									on:click={() => switchTab('processed')}
									aria-selected={activeTab === 'processed'}
								>
									Processed Data
								</button>
							</li>
							<li class="mr-2" role="presentation">
								<button
									class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'raw'
										? 'border-blue-600 text-blue-600'
										: 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
									type="button"
									role="tab"
									on:click={() => switchTab('raw')}
									aria-selected={activeTab === 'raw'}
								>
									Raw OpenAI Response
								</button>
							</li>
						</ul>
					</div>

					<!-- Tab content -->
					<div>
						<div
							class="max-h-[50vh] overflow-auto rounded-md bg-gray-100 p-4 dark:bg-gray-900 {activeTab ===
							'processed'
								? ''
								: 'hidden'}"
							role="tabpanel"
						>
							<pre class="font-mono text-sm">{formatJSON(jsonResponse)}</pre>
						</div>
						<div
							class="max-h-[50vh] overflow-auto rounded-md bg-gray-100 p-4 dark:bg-gray-900 {activeTab ===
							'raw'
								? ''
								: 'hidden'}"
							role="tabpanel"
						>
							<pre class="font-mono text-sm">{formatJSON(rawJsonResponse)}</pre>
						</div>
					</div>

					<div class="mt-4">
						<p class="text-sm text-gray-600 dark:text-gray-400">
							<span class="font-medium">Note:</span> The UI displays transformed data to match the expected
							format. The raw tab shows the original OpenAI response.
						</p>
					</div>
				</div>
			{/if}

			<!-- OpenAI Response Viewer -->
			{#if rawJsonResponse && rawJsonResponse.data}
				<div class="mb-8">
					<h2 class="mb-4 text-xl font-semibold">OpenAI Response Explorer</h2>
					<div class="w-full">
						<OpenAIResponseTable
							data={rawJsonResponse.data}
							title="JSON Data Explorer"
							initialExpandedDepth={10}
						/>
					</div>
				</div>
			{/if}

			<!-- Quick metrics -->
			<div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
				<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</h3>
					<p class="text-lg font-semibold">{jsonResponse.industry || 'N/A'}</p>
				</div>
				<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Sector</h3>
					<p class="text-lg font-semibold">{jsonResponse.sector || 'N/A'}</p>
				</div>
				<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Competitors</h3>
					<p class="text-lg font-semibold">{jsonResponse.products?.competitors?.length || 0}</p>
				</div>
				<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Products</h3>
					<p class="text-lg font-semibold">{jsonResponse.products?.productLines?.length || 0}</p>
				</div>
			</div>

			<!-- SWOT Analysis -->
			{#if jsonResponse.analysis?.swot}
				<div class="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-4 text-xl font-semibold">SWOT Analysis</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Strengths -->
						<div
							class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20"
						>
							<h3 class="mb-3 font-semibold text-green-800 dark:text-green-300">Strengths</h3>
							<ul class="space-y-2">
								{#each jsonResponse.analysis.swot.strengths as strength}
									<li class="flex items-start">
										<span class="mt-1 mr-2 text-green-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clip-rule="evenodd"
												/>
											</svg>
										</span>
										<div>
											<span>{strength.text}</span>
											<span
												class="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium {getImpactColor(
													strength.impact
												)}"
											>
												{strength.impact}
											</span>
										</div>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Weaknesses -->
						<div
							class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
						>
							<h3 class="mb-3 font-semibold text-red-800 dark:text-red-300">Weaknesses</h3>
							<ul class="space-y-2">
								{#each jsonResponse.analysis.swot.weaknesses as weakness}
									<li class="flex items-start">
										<span class="mt-1 mr-2 text-red-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
													clip-rule="evenodd"
												/>
											</svg>
										</span>
										<div>
											<span>{weakness.text}</span>
											<span
												class="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium {getImpactColor(
													weakness.impact
												)}"
											>
												{weakness.impact}
											</span>
										</div>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Opportunities -->
						<div
							class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20"
						>
							<h3 class="mb-3 font-semibold text-blue-800 dark:text-blue-300">Opportunities</h3>
							<ul class="space-y-2">
								{#each jsonResponse.analysis.swot.opportunities as opportunity}
									<li class="flex items-start">
										<span class="mt-1 mr-2 text-blue-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
													clip-rule="evenodd"
												/>
											</svg>
										</span>
										<div>
											<span>{opportunity.text}</span>
											<span
												class="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium {getImpactColor(
													opportunity.impact
												)}"
											>
												{opportunity.impact}
											</span>
										</div>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Threats -->
						<div
							class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20"
						>
							<h3 class="mb-3 font-semibold text-yellow-800 dark:text-yellow-300">Threats</h3>
							<ul class="space-y-2">
								{#each jsonResponse.analysis.swot.threats as threat}
									<li class="flex items-start">
										<span class="mt-1 mr-2 text-yellow-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
													clip-rule="evenodd"
												/>
											</svg>
										</span>
										<div>
											<span>{threat.text}</span>
											<span
												class="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium {getImpactColor(
													threat.impact
												)}"
											>
												{threat.impact}
											</span>
										</div>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			{/if}

			<!-- Porter's Five Forces -->
			{#if jsonResponse.analysis?.portersFiveForces}
				<div class="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-4 text-xl font-semibold">Porter's Five Forces</h2>
					<div class="space-y-4">
						<!-- Competitive Rivalry -->
						<div>
							<div class="flex items-center justify-between">
								<span class="font-medium">Competitive Rivalry</span>
								<span class="text-sm"
									>{jsonResponse.analysis.portersFiveForces.competitiveRivalry}/5</span
								>
							</div>
							<div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-2 rounded-full bg-blue-500"
									style="width: {getForceValue(
										jsonResponse.analysis.portersFiveForces.competitiveRivalry
									)}"
								></div>
							</div>
						</div>

						<!-- Supplier Power -->
						<div>
							<div class="flex items-center justify-between">
								<span class="font-medium">Supplier Power</span>
								<span class="text-sm"
									>{jsonResponse.analysis.portersFiveForces.supplierPower}/5</span
								>
							</div>
							<div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-2 rounded-full bg-green-500"
									style="width: {getForceValue(
										jsonResponse.analysis.portersFiveForces.supplierPower
									)}"
								></div>
							</div>
						</div>

						<!-- Buyer Power -->
						<div>
							<div class="flex items-center justify-between">
								<span class="font-medium">Buyer Power</span>
								<span class="text-sm">{jsonResponse.analysis.portersFiveForces.buyerPower}/5</span>
							</div>
							<div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-2 rounded-full bg-purple-500"
									style="width: {getForceValue(jsonResponse.analysis.portersFiveForces.buyerPower)}"
								></div>
							</div>
						</div>

						<!-- Threat of Substitutes -->
						<div>
							<div class="flex items-center justify-between">
								<span class="font-medium">Threat of Substitutes</span>
								<span class="text-sm"
									>{jsonResponse.analysis.portersFiveForces.threatOfSubstitutes}/5</span
								>
							</div>
							<div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-2 rounded-full bg-yellow-500"
									style="width: {getForceValue(
										jsonResponse.analysis.portersFiveForces.threatOfSubstitutes
									)}"
								></div>
							</div>
						</div>

						<!-- Threat of New Entrants -->
						<div>
							<div class="flex items-center justify-between">
								<span class="font-medium">Threat of New Entrants</span>
								<span class="text-sm"
									>{jsonResponse.analysis.portersFiveForces.threatOfNewEntrants}/5</span
								>
							</div>
							<div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-2 rounded-full bg-red-500"
									style="width: {getForceValue(
										jsonResponse.analysis.portersFiveForces.threatOfNewEntrants
									)}"
								></div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Product Lines -->
			{#if jsonResponse.products?.productLines && jsonResponse.products.productLines.length > 0}
				<div class="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-4 text-xl font-semibold">Product Lines</h2>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each jsonResponse.products.productLines as product}
							<div
								class="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
							>
								<div class="mb-2 flex items-center justify-between">
									<h3 class="font-medium">{product.name}</h3>
									<span
										class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										{product.growth}
									</span>
								</div>
								<div class="mb-3">
									<div class="flex items-center justify-between text-sm">
										<span class="text-gray-500 dark:text-gray-400">Revenue Share</span>
										<span class="font-medium">{product.revenuePercentage}%</span>
									</div>
									<div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
										<div
											class="h-2 rounded-full bg-blue-500"
											style="width: {product.revenuePercentage}%"
										></div>
									</div>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Competitors Table -->
			{#if jsonResponse.products?.competitors && jsonResponse.products.competitors.length > 0}
				<div class="mb-8 overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
					<div class="p-6 pb-3">
						<h2 class="text-xl font-semibold">Key Competitors</h2>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
									>
										Competitor
									</th>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
									>
										Market Share
									</th>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
									>
										Primary Competition
									</th>
								</tr>
							</thead>
							<tbody
								class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
							>
								{#each jsonResponse.products.competitors as competitor}
									<tr>
										<td
											class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white"
										>
											{competitor.name}
										</td>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300"
										>
											<div class="flex items-center">
												<span class="mr-2">{competitor.marketShare}%</span>
												<div class="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
													<div
														class="h-2 rounded-full bg-blue-500"
														style="width: {competitor.marketShare}%"
													></div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
											{competitor.primaryCompetition}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Future Scenarios -->
			{#if jsonResponse.analysis?.futureScenarios && jsonResponse.analysis.futureScenarios.length > 0}
				<div class="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-4 text-xl font-semibold">Future Scenarios</h2>
					<div class="space-y-4">
						{#each jsonResponse.analysis.futureScenarios as scenario}
							<div
								class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30"
							>
								<div class="mb-2 flex items-center justify-between">
									<h3 class="font-medium">{scenario.title}</h3>
									<div class="flex items-center">
										<span class="mr-2 text-sm">{(scenario.probability * 100).toFixed(0)}%</span>
										<div class="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
											<div
												class="h-2 rounded-full {getProbabilityColor(scenario.probability)}"
												style="width: {scenario.probability * 100}%"
											></div>
										</div>
									</div>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-300">{scenario.description}</p>
								<div class="mt-2">
									<span
										class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {getImpactColor(
											scenario.impact
										)}"
									>
										{scenario.impact} impact
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Empty state -->
		<div
			class="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-6 text-gray-500 shadow-md dark:bg-gray-800 dark:text-gray-400"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mb-2 h-12 w-12"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<p class="text-center">Enter a company name in the input field above and click Generate.</p>
			<p class="mt-2 text-center text-sm">
				This tool simulates an AI-powered competitive analysis.
			</p>
		</div>
	{/if}
</div>

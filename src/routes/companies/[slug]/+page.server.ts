/**
 * SERVER-SIDE CODE
 *
 * This file contains server-side data loading logic for the company detail page.
 * The load function runs on the server during SSR (Server-Side Rendering).
 * It fetches data from our internal API and prepares it for the page component.
 *
 * Using the .server.ts extension explicitly marks this as server-only code.
 */
import type { LoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { EnhancedCompanyData } from './types';
import {
	mockMarketPositionData,
	mockClassificationData,
	mockLeadershipData,
	mockGlobalPresenceData,
	mockFinancialMetricsData,
	mockProductsData,
	mockSwotAnalysisData,
	mockPortersFiveForces,
	mockFutureScenarios,
	mockNewsData,
	mockFaqData
} from './mockData';

export const load = async ({ params, fetch, setHeaders, url }: LoadEvent) => {
	const { slug } = params;
	// Get the active tab from the URL query parameter, default to 'overview'
	const activeTab = url.searchParams.get('tab') || 'overview';

	try {
		// Use our internal API to fetch the company data
		const response = await fetch(`/api/rest/v1/research/company?slug=${slug}`);

		if (!response.ok) {
			const errorData = await response.json();
			throw error(response.status, errorData.error?.message || 'Failed to load company data');
		}

		const json = await response.json();
		const companyData = json.data;

		// If no company data was found, return null
		if (!companyData) {
			throw error(404, 'Company not found');
		}

		// DEBUG: Log the raw API response to check for logoUrl
		console.log(
			'DEBUG: Raw API company data',
			JSON.stringify(
				{
					id: companyData.id,
					slug: companyData.slug,
					name: companyData.name || companyData.nameLegal,
					logoUrl: companyData.logoUrl,
					// Log all keys to see what fields are available
					availableFields: Object.keys(companyData)
				},
				null,
				2
			)
		);

		// Enhance with mock data for UI components not yet in API
		const enhancedData: EnhancedCompanyData = {
			...companyData,
			// Map API fields to expected fields if needed
			name: companyData.name || companyData.nameBrand || companyData.nameLegal,

			// CRITICAL: The API provides logoUrl directly, which is used by
			// the image handling system (getImageUrl, etc.) to create the full image URL
			// This should already be in the format of a path like "/logos/eqc/EQcesTGfwOmm-6VMYcW96mw.jpeg"
			// logoUrl: companyData.logoUrl,  // This field should already be propagated from ...companyData

			// Overview tab data
			marketPosition: mockMarketPositionData(companyData),
			classification: mockClassificationData(companyData),
			leadership: mockLeadershipData(companyData),
			globalPresence: mockGlobalPresenceData(companyData),

			// Additional tab data
			financialMetrics: mockFinancialMetricsData(companyData),
			products: mockProductsData(companyData),
			analysis: {
				swot: mockSwotAnalysisData(companyData),
				portersFiveForces: mockPortersFiveForces(companyData),
				futureScenarios: mockFutureScenarios(companyData)
			},
			news: mockNewsData(companyData),
			faq: mockFaqData(companyData)
		};

		// Set cache headers
		setHeaders({
			'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
		});

		return {
			company: enhancedData,
			activeTab
		};
	} catch (err) {
		// Enhanced error logging with console logging
		const errorMessage = err instanceof Error ? err.message : String(err);
		const errorStack = err instanceof Error ? err.stack : undefined;

		console.error(
			'DEBUG: Error loading company data',
			JSON.stringify(
				{
					error: errorMessage,
					stack: errorStack,
					slug,
					requestUrl: url.toString()
				},
				null,
				2
			)
		);

		throw error(404, 'Company not found');
	}
};

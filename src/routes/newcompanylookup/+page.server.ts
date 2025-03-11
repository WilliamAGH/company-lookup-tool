import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the company lookup page
 * This is a minimal implementation as most of the functionality is client-side
 * but could be extended to include server-side data fetching if needed
 */
export const load: PageServerLoad = async () => {
	return {
		// You can add any server-loaded data here if needed
		pageTitle: 'Company Competitive Analysis Tool',
		description: 'Test the AI LLM competitive analysis with a company name lookup'
	};
};

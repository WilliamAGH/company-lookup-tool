import db from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import { apiHandler, errorResponse, successResponse } from '$lib/server/api/utils';
import type { EntityWebUrl } from '$lib/schemas/research';
import { sql } from '$lib/database/sql.server';

/**
 * API endpoint to fetch url data and related companies from the research database
 *
 * @route GET /api/rest/v1/research/url
 * @query url - URL to look up
 * @query pretty - Set to "false" to disable pretty-formatted JSON (enabled by default)
 * @returns URL data and related companies JSON object
 *
 * @example
 * // Fetch by URL
 * GET /api/rest/v1/research/url?url=https://example.com
 *
 * // Debug mode
 * GET /api/rest/v1/research/url?url=https://example.com&debug=true
 *
 * // Disable pretty print JSON
 * GET /api/rest/v1/research/url?url=https://example.com&pretty=false
 */
export const GET = apiHandler(async (event: RequestEvent) => {
	const { url } = event;
	const urlParam = url.searchParams.get('url');

	if (!urlParam) {
		return errorResponse(
			'Missing required parameter. Please provide url as a query parameter.',
			400,
			undefined,
			'/api/rest/v1/research/url?url=https://example.com',
			event
		);
	}

	// Fetch the URL data using direct SQL for flexibility
	const urlResult = (await sql`
		SELECT * FROM research.res_web_url_new
		WHERE url = ${urlParam}
	`) as EntityWebUrl[];

	// If no URL found, return early
	if (!urlResult || urlResult.length === 0) {
		return errorResponse(
			'URL not found in our database',
			404,
			undefined,
			'Try a different URL or check the format',
			event
		);
	}

	// Get all company IDs related to this URL
	const companyIds = urlResult
		.filter((url: EntityWebUrl) => url.entity_id !== null)
		.map((url: EntityWebUrl) => url.entity_id);

	// If there are any company IDs, fetch the company data
	const companies = [];
	if (companyIds.length > 0) {
		// Fetch companies with those IDs
		// Note: This is a simplified approach; in a real app with many IDs,
		// you might want to use an "IN" clause with pagination
		for (const companyId of companyIds) {
			// Get company entity data by ID using our entity queries
			const companyResult = await db.entity.getById(companyId as string);

			if (companyResult) {
				companies.push(companyResult);
			}
		}
	}

	// Return both URL and company data
	return successResponse(
		{
			url: urlResult,
			relatedCompanies: companies
		},
		event
	);
});

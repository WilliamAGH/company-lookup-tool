import type { RequestEvent } from '@sveltejs/kit';
import {
	apiHandler,
	errorResponse,
	isValidUuid,
	notFoundError,
	successResponse
} from '$lib/server/api/utils';
import db from '$lib/server/db';
import type { CompanyEntity, EntityText } from '$lib/schemas/research';
import type { EntityWebUrl } from '$lib/schemas/research';
import type { EntityTypeTagsByCategory } from '$lib/server/db/queries/type_ref';

// Import company object processors - use existing shared ones
import { getEntityTypeData, categorizeEntityTypes } from '../sharedObjects/typeTagRef';
import { getCompanyRelatedUrls } from '../sharedObjects/url';
import { getEntityTextData } from '../sharedObjects/text';

// Define response interface using specific CompanyEntity type from schema
interface CompanyResponse extends CompanyEntity {
	// Additional friendly properties for API response
	name: string;
	logoUrl?: string | null;
	faviconUrl?: string | null;
	foundedYear?: number | null;
	// Related data
	relatedUrls: EntityWebUrl[];
	typeTags: EntityTypeTagsByCategory;
	texts: Record<string, EntityText[]>;
}

/**
 * API endpoint to fetch company data from the research database
 *
 * This endpoint retrieves company information from the research schema,
 * including related URLs, type categorization, and text data.
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Parallel query execution for related data
 * - Selective column loading (only querying fields needed)
 * - Using indexed fields for all filtering operations
 * - Minimal data transformations in memory
 *
 * @database PostgreSQL
 * @schema research
 * @tables res_entity (main), res_entity_type_join, res_type_ref, res_web_url_new, res_text_new
 * @link src/routes/api/rest/v1/research/sharedObjects/typeTagRef.ts Shared type tag reference functionality
 * @link src/routes/api/rest/v1/research/sharedObjects/url.ts Shared URL functionality
 * @link src/routes/api/rest/v1/research/sharedObjects/text.ts Shared text functionality
 * @link src/routes/api/rest/v1/research/company/objects/companyTypeTag.ts Company-specific type tag processing
 * @link src/routes/api/rest/v1/research/company/objects/companyText.ts Company-specific text processing
 * @link src/routes/companies/[slug]/components/CompanyHeader/CompanyExternalLinks.svelte UI component example using this data
 *
 * ARCHITECTURE NOTES:
 * This endpoint follows a modular approach with shared functionality:
 * 1. Direct database access for company-specific data
 * 2. Shared objects in ../sharedObjects for reusable core functionality
 * 3. Company-specific adapters in ./objects that leverage shared components
 * 4. Response types defined adjacent to the API endpoint
 *
 * @route GET /api/rest/v1/research/company
 * @query id - UUID of the company to retrieve
 * @query slug - URL slug of the company to retrieve
 * @query pretty - Set to "false" to disable pretty-formatted JSON (enabled by default)
 * @returns Company data JSON object with related URLs, type information, and text data nested
 *
 * @example
 * // Fetch by ID
 * GET /api/rest/v1/research/company?id=123e4567-e89b-12d3-a456-426614174000
 *
 * // Fetch by slug
 * GET /api/rest/v1/research/company?slug=acme-corporation
 *
 * // Debug mode
 * GET /api/rest/v1/research/company?debug=true
 *
 * // Disable pretty print JSON
 * GET /api/rest/v1/research/company?id=123e4567-e89b-12d3-a456-426614174000&pretty=false
 */
export const GET = apiHandler(async (event: RequestEvent) => {
	const { url } = event;
	const id = url.searchParams.get('id');
	const slug = url.searchParams.get('slug');

	if (!id && !slug) {
		return errorResponse(
			'Missing required parameter. Please provide either id (36-character UUID) or slug (URL slug) as a query parameter.',
			400,
			undefined,
			'/api/rest/v1/research/company?id=123e4567-e89b-12d3-a456-426614174000 or /api/rest/v1/research/company?slug=acme-corporation',
			event
		);
	}

	// Validate UUID format if ID provided
	if (id && !isValidUuid(id)) {
		return errorResponse('Invalid UUID format', 400, undefined, undefined, event);
	}

	// Get base company data - using our entity queries with proper null checking
	const dbCompany =
		id && id.length > 0
			? await db.entity.getById(id)
			: slug && slug.length > 0
				? await db.entity.getBySlug(slug)
				: null;

	if (!dbCompany) {
		return notFoundError('Company', event);
	}

	const companyId = dbCompany.id;

	// Execute related queries in parallel for optimal performance
	// This reduces total response time by running all queries simultaneously
	const [relatedUrls, typeData, textData] = await Promise.all([
		getCompanyRelatedUrls(companyId as string), // Type assertion
		getEntityTypeData(companyId as string), // Type assertion
		getEntityTextData(companyId as string) // Type assertion
	]);

	// Transform data into categorized structures
	// These are efficient O(n) operations with a single pass through the data
	const typeTagsByCategory = categorizeEntityTypes(typeData);

	// Create a texts by type object
	const textsByType: Record<string, EntityText[]> = {};
	textData.forEach((text) => {
		const type = text.text_type || 'other';
		if (!textsByType[type]) {
			textsByType[type] = [];
		}
		textsByType[type].push(text);
	});

	// Start with the company entity and add friendly alias properties
	const responseData: CompanyResponse = {
		// Using spread to include all original properties from dbCompany
		...dbCompany,

		// Add friendly property names for common fields
		name: dbCompany.name_brand || (dbCompany.name_legal ?? 'Unknown'),
		logoUrl: dbCompany.file_logo_square,
		faviconUrl: dbCompany.file_logo_favicon_square,
		foundedYear: dbCompany.date_year_established,

		// Add related data
		relatedUrls,
		typeTags: typeTagsByCategory,
		texts: textsByType
	};

	// Return success response
	return successResponse(responseData, event);
});

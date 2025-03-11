/**
 * Entity Related URLs
 *
 * Handles the processing and transformation of entity URL information from
 * the research database. This module provides utilities to fetch related URLs
 * for any entity from the res_web_url_new table.
 *
 * @database PostgreSQL
 * @schema research
 * @tables res_web_url_new
 * @link src/routes/companies/[slug]/components/CompanyHeader/CompanyExternalLinks.svelte UI component using this data
 * @link $lib/schemas/research/url.schema.ts - Source of truth schema
 */

import db from '$lib/server/db';
import type { EntityWebUrl } from '$lib/schemas/research';
import { z } from 'zod';

// Import the existing EntityWebUrl type from the Zod schema
import { entityWebUrlSchema } from '$lib/schemas/research/url.schema';

/**
 * Related URL information schema derived from the EntityWebUrl schema
 * but extended with additional fields needed for the UI
 * Uses composition to avoid circular dependencies
 */
export const relatedUrlSchema = entityWebUrlSchema.extend({
	// Additional fields needed for UI but not in the database
	title: z.string().nullable().optional(),
	source: z.string().nullable().optional()
});

// Derive type from schema to maintain DRY principle
export type RelatedUrl = z.infer<typeof relatedUrlSchema>;

/**
 * Get related URLs for a specific entity
 *
 * This query is optimized for performance by:
 * 1. Using our urlQueries to fetch the data
 * 2. Using the indexed entity_id field for filtering
 * 3. Using our SQL client with prepared statements
 * 4. Minimizing data transformation overhead
 *
 * @param entityId - The ID of the entity to fetch URLs for
 * @returns An array of related URL data
 */
export async function getCompanyRelatedUrls(entityId: string): Promise<RelatedUrl[]> {
	// Use our urlQueries to fetch the related URLs
	const rawUrls = await db.url.getCompanyRelatedUrls(entityId);

	// Efficient transformation with a single map operation, maintaining snake_case field names
	return rawUrls.map((url: EntityWebUrl) => ({
		...url,
		title: null, // Additional fields not in the database
		source: null // but required in the response interface
	}));
}

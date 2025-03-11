/**
 * URL data query builder for PostgreSQL
 *
 * This file provides type-safe queries for the res_web_url_new table
 * using Zod schemas as the single source of truth for types.
 *
 * @link $lib/schemas/research/url.schema.ts - Source of truth schema
 */

import { browser } from '$app/environment';
import { sql } from '../../../database/sql.server';
import type { EntityWebUrl } from '$lib/schemas/research';

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

/**
 * Type-safe URL data queries for the res_web_url_new table
 * All queries are READ-ONLY as specified in project requirements
 */
export const urlQueries = {
	/**
	 * Get URL data by ID
	 *
	 * @param id ID of the URL record
	 * @returns EntityWebUrl or null if not found
	 */
	getById: async (id: number): Promise<EntityWebUrl | null> => {
		if (!sql) return null;

		const results = await sql`
			SELECT * FROM research.res_web_url_new
			WHERE id = ${id}
		`;
		return (results[0] as EntityWebUrl) || null;
	},

	/**
	 * Get related URLs for a specific entity
	 *
	 * This query is optimized for performance by:
	 * 1. Selecting only the specific columns needed
	 * 2. Using the indexed entityId field for filtering
	 * 3. Using prepared statements through Bun's SQL tagged templates
	 *
	 * @param entityId - The ID of the entity to fetch URLs for
	 * @returns An array of related URL data
	 */
	getCompanyRelatedUrls: async (entityId: string): Promise<EntityWebUrl[]> => {
		if (!sql) return [];

		// Fetch URLs for the entity
		const results = await sql`
			SELECT 
				id,
				entity_id as "entity_id",
				url_type as "url_type",
				url,
				updated_at as "updated_at",
				created_at as "created_at"
			FROM research.res_web_url_new
			WHERE entity_id = ${entityId}
		`;

		// Data already in snake_case from the database - no transformation needed
		return results as EntityWebUrl[];
	},

	/**
	 * Get URLs by URL type
	 *
	 * @param entityId UUID of the entity
	 * @param urlType Type of URL to retrieve
	 * @returns Array of EntityWebUrl records
	 */
	getByUrlType: async (entityId: string, urlType: string): Promise<EntityWebUrl[]> => {
		if (!sql) return [];

		const results = await sql`
			SELECT *
			FROM research.res_web_url_new
			WHERE entity_id = ${entityId}
			  AND url_type = ${urlType}
			ORDER BY is_primary DESC, created_at DESC
		`;
		return results as EntityWebUrl[];
	},

	/**
	 * Get primary URL by URL type
	 *
	 * @param entityId UUID of the entity
	 * @param urlType Type of URL to retrieve
	 * @returns Primary EntityWebUrl or null if not found
	 */
	getPrimaryByUrlType: async (entityId: string, urlType: string): Promise<EntityWebUrl | null> => {
		if (!sql) return null;

		const results = await sql`
			SELECT *
			FROM research.res_web_url_new
			WHERE entity_id = ${entityId}
			  AND url_type = ${urlType}
			  AND is_primary = true
			LIMIT 1
		`;
		return (results[0] as EntityWebUrl) || null;
	}
};

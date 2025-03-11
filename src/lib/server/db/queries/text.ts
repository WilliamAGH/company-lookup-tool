/**
 * Text data query builder for PostgreSQL
 *
 * This file provides type-safe queries for the res_text_new table
 * using Zod schemas as the single source of truth for types.
 *
 * @link $lib/schemas/research/text.schema.ts - Source of truth schema
 */

import { browser } from '$app/environment';
import { sql } from '../../../database/sql.server';
import type { EntityText } from '$lib/schemas/research';

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

/**
 * Type-safe text data queries for the res_text_new table
 * All queries are READ-ONLY as specified in project requirements
 */
export const textQueries = {
	/**
	 * Get text data by ID
	 *
	 * @param id ID of the text record
	 * @returns EntityText or null if not found
	 */
	getById: async (id: number): Promise<EntityText | null> => {
		if (!sql) return null;

		const results = await sql`
			SELECT * FROM research.res_text_new
			WHERE id = ${id}
		`;
		return (results[0] as EntityText) || null;
	},

	/**
	 * Retrieves text data for a specific entity
	 *
	 * @param entityId UUID of the entity to retrieve text for
	 * @returns Array of text records associated with the entity
	 */
	getEntityTextData: async (entityId: string): Promise<EntityText[]> => {
		if (!sql) return [];

		// Query the text data for the entity using indexed entityId field for performance
		// Include texts where:
		// 1. entityId matches AND
		// 2. EITHER resObject is 'res_entity' OR resObject is NULL/empty
		const results = await sql`
			SELECT 
				id,
				res_object as "res_object",
				text_type as "text_type",
				text_name as "text_name",
				text as "text",
				source as "source",
				entity_id as "entity_id",
				fund_id as "fund_id",
				person_id as "person_id",
				is_current as "is_current",
				is_primary as "is_primary",
				created_at as "created_at",
				updated_at as "updated_at"
			FROM research.res_text_new
			WHERE entity_id = ${entityId}
			  AND (
				res_object = 'res_entity' 
				OR res_object IS NULL 
				OR res_object = ''
			  )
		`;

		return results as EntityText[];
	},

	/**
	 * Get text records by text type
	 *
	 * @param entityId UUID of the entity
	 * @param textType Type of text to retrieve
	 * @returns Array of EntityText records
	 */
	getByTextType: async (entityId: string, textType: string): Promise<EntityText[]> => {
		if (!sql) return [];

		const results = await sql`
			SELECT *
			FROM research.res_text_new
			WHERE entity_id = ${entityId}
			  AND text_type = ${textType}
			ORDER BY is_primary DESC, created_at DESC
		`;
		return results as EntityText[];
	},

	/**
	 * Get primary text record by text type
	 *
	 * @param entityId UUID of the entity
	 * @param textType Type of text to retrieve
	 * @returns Primary EntityText or null if not found
	 */
	getPrimaryByTextType: async (entityId: string, textType: string): Promise<EntityText | null> => {
		if (!sql) return null;

		const results = await sql`
			SELECT *
			FROM research.res_text_new
			WHERE entity_id = ${entityId}
			  AND text_type = ${textType}
			  AND is_primary = true
			LIMIT 1
		`;
		return (results[0] as EntityText) || null;
	}
};

/**
 * Type reference and entity type join query builder for PostgreSQL
 *
 * This file provides type-safe queries for the res_type_ref and res_entity_type_join tables
 * using Zod schemas as the single source of truth for types.
 *
 * @link $lib/schemas/research/type_ref.schema.ts - Type reference schema
 * @link $lib/schemas/research/entity_type_join.schema.ts - Entity-type join schema
 */

import { browser } from '$app/environment';
import { sql } from '../../../database/sql.server';
import type { TypeReference } from '$lib/schemas/research';

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

/**
 * Interface for categorized entity types
 */
export interface EntityTypeTagsByCategory {
	[category: string]: EntityTypeTag[];
}

/**
 * Interface for entity type tag data used in API responses
 */
export interface EntityTypeTag {
	type_id: number;
	type_category: string;
	type_name: string;
	slug: string;
	type_color_id: number | null;
	is_primary: boolean;
	type_data_source: string | null;
}

/**
 * Type-safe type reference queries for the res_type_ref and res_entity_type_join tables
 * All queries are READ-ONLY as specified in project requirements
 */
export const typeRefQueries = {
	/**
	 * Get type reference by ID
	 *
	 * @param id ID of the type reference
	 * @returns TypeReference or null if not found
	 */
	getById: async (id: string | number): Promise<TypeReference | null> => {
		if (!sql) return null;

		// Direct table reference using research schema
		const results = await sql`
			SELECT * FROM research.res_type_ref
			WHERE id = ${id}
		`;
		return (results[0] as TypeReference) || null;
	},

	/**
	 * Get entity type data with optimized join between
	 * res_entity_type_join and res_type_ref tables.
	 *
	 * @param entityId The UUID of the entity to fetch types for
	 * @returns Array of entity type tag information
	 */
	getEntityTypeData: async (entityId: string): Promise<EntityTypeTag[]> => {
		if (!sql) return [];

		// Direct SQL with table references
		const results = await sql`
			SELECT 
				etj.type_id as type_id,
				tr.type as type_category,
				tr.name as type_name,
				tr.slug as slug,
				tr.color_id as type_color_id,
				etj.is_primary as is_primary,
				etj.source as type_data_source
			FROM research.res_entity_type_join etj
			INNER JOIN research.res_type_ref tr
				ON etj.type_id = tr.id
			WHERE etj.entity_id = ${entityId}
				AND etj.is_current = true
				AND tr.res_object = 'res_entity'
		`;

		return results as EntityTypeTag[];
	},

	/**
	 * Transform entity type data into a categorized structure
	 *
	 * @param typeData The raw type data from the database
	 * @returns An object with types grouped by category
	 */
	categorizeEntityTypes: (typeData: EntityTypeTag[]): EntityTypeTagsByCategory => {
		const typesByCategory: EntityTypeTagsByCategory = {};

		// Single pass through the results for O(n) performance
		for (const item of typeData) {
			const category = item.type_category || 'uncategorized';

			// Initialize category array only when needed
			if (!typesByCategory[category]) {
				typesByCategory[category] = [];
			}

			// Raw data is already in snake_case as needed by our schema
			typesByCategory[category].push(item);
		}

		return typesByCategory;
	},

	/**
	 * Get type references by category
	 *
	 * @param category Type category to query for
	 * @returns Array of TypeReference objects
	 */
	getByCategory: async (category: string): Promise<TypeReference[]> => {
		if (!sql) return [];

		const results = await sql`
			SELECT * FROM research.res_type_ref
			WHERE type = ${category}
			ORDER BY name ASC
		`;
		return results as TypeReference[];
	}
};

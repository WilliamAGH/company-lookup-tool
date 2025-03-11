/**
 * Entity detail query builder for PostgreSQL
 *
 * This file provides type-safe queries for the res_entity_detail table
 * using Zod schemas as the single source of truth for types.
 *
 * @link $lib/schemas/research/detail.schema.ts - Source of truth schema
 */

import { browser } from '$app/environment';
import { sql } from '../../../database/sql.server';
import type { EntityDetail } from '$lib/schemas/research';
import type { UUID } from '$lib/schemas/base/id.schema';

// Define table metadata inline
const entityDetailTableInfo = {
	schema: 'research',
	tableName: 'res_entity_detail'
};

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

/**
 * Type-safe entity detail queries for the res_entity_detail table
 * All queries are READ-ONLY as specified in project requirements
 */
export const entityDetailQueries = {
	/**
	 * Get entity detail by ID
	 *
	 * @param id Numeric ID of the entity detail
	 * @returns EntityDetail or null if not found
	 */
	getById: async (id: number): Promise<EntityDetail | null> => {
		if (!sql) return null;

		const fullTableName = `${entityDetailTableInfo.schema}.${entityDetailTableInfo.tableName}`;

		const results = await sql`
			SELECT * FROM ${sql(fullTableName)}
			WHERE id = ${id}
		`;
		return (results[0] as EntityDetail) || null;
	},

	/**
	 * Get all details for an entity
	 *
	 * @param entityId UUID of the entity
	 * @returns Array of EntityDetail objects
	 */
	getByEntityId: async (entityId: UUID): Promise<EntityDetail[]> => {
		if (!sql) return [];

		const results = await sql`
			SELECT * FROM research.res_entity_detail
			WHERE entity_id = ${entityId}
			ORDER BY id ASC
		`;
		return results as EntityDetail[];
	},

	/**
	 * Get entity details by type
	 *
	 * @param entityId UUID of the entity
	 * @param detailType Type of detail to fetch
	 * @returns Array of EntityDetail objects
	 */
	getByType: async (entityId: UUID, detailType: string): Promise<EntityDetail[]> => {
		if (!sql) return [];

		const results = await sql`
			SELECT * FROM research.res_entity_detail
			WHERE entity_id = ${entityId}
			AND type_research_detail = ${detailType}
			ORDER BY id ASC
		`;
		return results as EntityDetail[];
	},

	/**
	 * Get latest entity detail by type
	 *
	 * @param entityId UUID of the entity
	 * @param detailType Type of detail to fetch
	 * @returns Most recent EntityDetail or null if not found
	 */
	getLatestByType: async (entityId: UUID, detailType: string): Promise<EntityDetail | null> => {
		if (!sql) return null;

		const results = await sql`
			SELECT * FROM research.res_entity_detail
			WHERE entity_id = ${entityId}
			AND type_research_detail = ${detailType}
			ORDER BY as_of_date DESC NULLS LAST, created_at DESC
			LIMIT 1
		`;
		return (results[0] as EntityDetail) || null;
	},

	/**
	 * Get all entity details with pagination
	 *
	 * @param limit Maximum number of results
	 * @param offset Pagination offset
	 * @returns Array of EntityDetail objects
	 */
	list: async (limit = 20, offset = 0): Promise<EntityDetail[]> => {
		if (!sql) return [];

		const results = await sql`
			SELECT * FROM research.res_entity_detail
			ORDER BY id ASC
			LIMIT ${limit} OFFSET ${offset}
		`;
		return results as EntityDetail[];
	}
};

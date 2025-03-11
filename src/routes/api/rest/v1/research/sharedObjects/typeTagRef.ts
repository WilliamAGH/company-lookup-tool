/**
 * Type Tag Reference
 *
 * Provides core functionality for working with type references in the research database.
 * This shared module handles basic type reference data access and common interfaces.
 *
 * @database PostgreSQL
 * @schema research
 * @tables res_type_ref, res_entity_type_join
 * @link $lib/schemas/research/type_ref.schema.ts - Source of truth schema for type references
 * @link $lib/schemas/research/entity_type_join.schema.ts - Source of truth schema for entity-type joins
 */

import db from '$lib/server/db';

/**
 * Type import directly from the query file to maintain DRY principle and
 * ensure we're using types derived from the Zod schemas
 */
import type { EntityTypeTag, EntityTypeTagsByCategory } from '$lib/server/db/queries/type_ref';
export type { EntityTypeTag, EntityTypeTagsByCategory };

/**
 * Get entity type data with optimized join between
 * res_entity_type_join and res_type_ref tables.
 *
 * Uses our type_ref queries for optimized performance.
 *
 * @param entityId - The ID of the entity to fetch types for
 * @returns A query result with entity type information and category
 */
export async function getEntityTypeData(entityId: string): Promise<EntityTypeTag[]> {
	// Use our typeRefQueries instead of direct database access
	return db.typeRef.getEntityTypeData(entityId);
}

/**
 * Transform entity type data into a categorized structure
 *
 * Efficiently processes the database results into the response format
 * with a single pass through the data.
 *
 * @param typeData - The entity type data from the database
 * @returns An object with types grouped by category
 */
export function categorizeEntityTypes(typeData: EntityTypeTag[]): EntityTypeTagsByCategory {
	// Use our typeRefQueries categorization function
	return db.typeRef.categorizeEntityTypes(typeData);
}

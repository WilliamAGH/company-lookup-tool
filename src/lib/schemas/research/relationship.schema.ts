/**
 * Entity relationship Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity relationships
 * used throughout the application. These schemas define the relationship model
 * between companies, products, and related entities.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity relationship types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/entity_relationship.ts - Server-side database schema
 * @link $data-tools/openai.ts - OpenAI integration using these types
 */

import { z } from 'zod';
import { numericIdSchema, optionalUuidSchema } from '$lib/schemas/base/id.schema';

// Lazy reference to entity schema to avoid circular dependencies
const entitySchema = z.lazy(() => z.any());

/**
 * Valid relationship types between entities
 */
export const relationshipTypes = [
	'Competitor',
	'Category-Member',
	'Merger-Acquisition',
	'Acquirer-Acquiree',
	'Company-Division'
] as const;

/**
 * Relationship type enum
 */
export const relationshipTypeEnum = z.enum(relationshipTypes);
export type RelationshipType = z.infer<typeof relationshipTypeEnum>;

/**
 * Entity relationship schema
 */
export const entityRelationshipSchema = z.object({
	id: numericIdSchema.nullable().optional(),
	entity1: entitySchema.optional(),
	entity2: entitySchema.optional(),
	relationship_type: relationshipTypeEnum,
	is_current: z.boolean().optional(),
	source_id: optionalUuidSchema
});

/**
 * Entity relationship type derived from schema
 */
export type EntityRelationship = z.infer<typeof entityRelationshipSchema>;

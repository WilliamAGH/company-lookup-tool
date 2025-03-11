/**
 * Entity-type join Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity-type join records
 * used throughout the application. These schemas define the connections between
 * entities and their type classifications.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity type join types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/joins/schema/entity_type_join.ts - Server-side database schema
 * @link src/lib/routes/api/rest/v1/research/entity-types/+server.ts - API endpoints using these types
 */

import { z } from 'zod';
import { optionalUuidSchema } from '$lib/schemas/base/id.schema';
import { typeReferenceSchema } from './type_ref.schema';

// Lazy reference to entity schema to avoid circular dependencies
const entitySchema = z.lazy(() => z.any());

/**
 * Entity type join schema that connects entities to their type classifications
 * Using snake_case to match database column names directly
 */
export const entityTypeJoinSchema = z.object({
	id: optionalUuidSchema,
	entity_id: optionalUuidSchema,
	type_id: z.number().int().positive().optional(),
	retire_res_type_id: z.number().int().positive().optional(),
	is_current: z.boolean().optional(),
	is_primary: z.boolean().optional(),
	source: z.string().optional(),
	updated_at: z.string().datetime().optional(),
	created_at: z.string().datetime().optional()
});

/**
 * Enhanced entity type join schema with resolved references
 * Used when presenting entity type data with all related information
 */
export const entityTypeJoinWithReferencesSchema = z.object({
	id: optionalUuidSchema,
	entity: entitySchema.optional(),
	type_reference: typeReferenceSchema.optional(),
	is_current: z.boolean().optional(),
	is_primary: z.boolean().optional(),
	source: z.string().optional(),
	updated_at: z.string().datetime().optional(),
	created_at: z.string().datetime().optional()
});

/**
 * Entity type join types derived from schemas
 */
export type EntityTypeJoin = z.infer<typeof entityTypeJoinSchema>;
export type EntityTypeJoinWithReferences = z.infer<typeof entityTypeJoinWithReferencesSchema>;

/**
 * Unique identifier Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity identifiers
 * used throughout the application. These schemas define the identifiers for
 * companies, products, and related entities.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity identifier types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/unique_id.ts - Server-side database schema
 */

import { z } from 'zod';
import { numericIdSchema, optionalUuidSchema } from '$lib/schemas/base/id.schema';

/**
 * Common identifier types
 * Note: DB currently only contains 'US EIN', but we include all supported types
 */
export const identifierTypes = [
	'ticker_symbol',
	'cik_number',
	'bloomberg_id',
	'duns_number',
	'US EIN'
] as const;

/**
 * Identifier type enum
 */
export const identifierTypeEnum = z.enum(identifierTypes);
export type IdentifierType = z.infer<typeof identifierTypeEnum>;

/**
 * Entity identifier schema
 * Simple version used in API responses
 */
export const entityIdentifierSchema = z.object({
	id_type: z.string(),
	unique_id: z.string()
});

/**
 * Complete unique identifier schema
 * Maps directly to database table structure
 * Using snake_case to match database column names directly
 */
export const uniqueIdSchema = z.object({
	id: numericIdSchema.optional(),
	unique_id: z.string(),
	id_type: z.string(),
	entity_id: optionalUuidSchema,
	fund_id: optionalUuidSchema,
	person_id: optionalUuidSchema,
	source: z.string().optional(),
	updated_at: z.string().datetime().optional(),
	created_at: z.string().datetime().optional()
});

/**
 * Types derived from schemas
 */
export type EntityIdentifier = z.infer<typeof entityIdentifierSchema>;
export type UniqueId = z.infer<typeof uniqueIdSchema>;

/**
 * Text data Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity text data
 * used throughout the application. These schemas define the structure for
 * descriptive text content associated with entities.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity text types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/text.ts - Server-side database schema
 * @link src/lib/routes/api/rest/v1/research/sharedObjects/text.ts - API utilities using these types
 */

import { z } from 'zod';
import { numericIdSchema, optionalUuidSchema } from '$lib/schemas/base/id.schema';

/**
 * Text content types from database
 */
export const textTypes = [
	'description_medium',
	'legacy_description_edited',
	'legacy_description_expanded',
	'legacy_description_short',
	'scraped_website'
] as const;

/**
 * Text type enum
 */
export const textTypeEnum = z.enum(textTypes);
export type TextType = z.infer<typeof textTypeEnum>;

/**
 * Entity text schema
 * Core definition of entity text records
 * Using snake_case to match database column names directly
 */
export const entityTextSchema = z.object({
	id: numericIdSchema.optional(),
	res_object: z.string().nullable().optional(),
	text_type: z.string().nullable().optional(),
	text_name: z.string().nullable().optional(),
	text: z.string().nullable().optional(),
	source: z.string().nullable().optional(),
	entity_id: optionalUuidSchema.nullable(),
	fund_id: optionalUuidSchema.nullable(),
	person_id: optionalUuidSchema.nullable(),
	is_current: z.boolean().optional(),
	is_primary: z.boolean().optional(),
	updated_at: z.string().datetime().nullable().optional(),
	created_at: z.string().datetime().nullable().optional()
});

/**
 * Entity text type derived from schema
 */
export type EntityText = z.infer<typeof entityTextSchema>;

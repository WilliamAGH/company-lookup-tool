/**
 * Type reference Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity type references
 * used throughout the application. These schemas define classification and tagging
 * for companies, products, and related entities.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all type reference types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/type_ref.ts - Server-side database schema
 * @link src/lib/server/db/joins/schema/entity_type_join.ts - Related join table schema
 */

import { z } from 'zod';
import { optionalUuidSchema } from '$lib/schemas/base/id.schema';

/**
 * Common product type values
 * These correspond to records where type='product_type'
 */
export const productTypes = ['Service', 'Digital Product', 'Physical Product', 'Unknown'] as const;

/**
 * Product type enum
 */
export const productTypeEnum = z.enum(productTypes);
export type ProductType = z.infer<typeof productTypeEnum>;

/**
 * Type reference schema
 * Using snake_case to match database column names directly
 */
export const typeReferenceSchema = z.object({
	id: optionalUuidSchema,
	res_object: z.string().optional(),
	type: z.string().optional(),
	lookup: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	color_id: z.number().int().optional(),
	is_current: z.boolean().optional(),
	updated_at: z.string().datetime().optional(),
	created_at: z.string().datetime().optional()
});

/**
 * Type reference type derived from schema
 */
export type TypeReference = z.infer<typeof typeReferenceSchema>;

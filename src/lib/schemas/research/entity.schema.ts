/**
 * Entity Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity structures
 * used throughout the application. These schemas define the core data model
 * for companies, products, and related entities.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/entity.ts - Server-side database schema
 */

import { z } from 'zod';
import { nullableUuidSchema } from '$lib/schemas/base/id.schema';

// Entity types enum
export const entityTypes = [
	'Company',
	'Investment Firm',
	'Product',
	'Product Category',
	'Fund'
] as const;

// Convert to Zod enum
export const entityTypeEnum = z.enum(entityTypes);
export type EntityType = z.infer<typeof entityTypeEnum>;

// Operating status enum
export const statusOperating = [
	'Active',
	'Operating',
	'Closed',
	'Inactive',
	'Acquired',
	'Liquidated',
	'Bankruptcy / Reorganization',
	'Unknown'
] as const;

// Convert to Zod enum
export const statusOperatingEnum = z.enum(statusOperating);
export type StatusOperating = z.infer<typeof statusOperatingEnum>;

// Import schemas for related entities, using lazy() to handle circular references
import { entityDetailSchema } from './detail.schema';
// Other schemas will be properly defined in their respective files
const entityUrlSchema = z.lazy(() => z.any()); // Will be properly defined in url.schema.ts
const entityIdentifierSchema = z.lazy(() => z.any()); // Will be properly defined in unique_id.schema.ts

/**
 * Base entity schema for common properties shared across all entity types
 *
 * Field names use snake_case to match database column names directly
 * as required by the schema-first DRY pattern.
 */
export const baseEntitySchema = z.object({
	id: nullableUuidSchema,
	name_brand: z.string(),
	name_legal: z.string().optional(),
	date_year_established: z.number().int().optional(),

	// Additional fields from PostgreSQL schema
	file_logo_square: z.string().optional(),
	file_logo_favicon_square: z.string().optional(),
	status_featured: z.boolean().default(false).optional(),
	status_hide_page: z.boolean().default(false).optional(),
	status_sitemap_show: z.boolean().default(true).optional(),
	status_verified: z.boolean().default(false).optional(),
	functional_currency: z.string().length(3).optional(),
	type_record: z.string().optional(),
	slug: z.string().optional(),
	source_id: z.string().optional(),
	updated_at: z.string().datetime().optional(),
	created_at: z.string().datetime().optional(),
	updated_at_unified: z.string().datetime().optional()
});

/**
 * Company entity schema
 * Extends the base entity with company-specific properties
 */
export const companyEntitySchema = baseEntitySchema.extend({
	status_operating: statusOperatingEnum.optional(),
	urls: z.array(entityUrlSchema).optional(),
	identifiers: z.array(entityIdentifierSchema).optional(),
	details: z.array(entityDetailSchema).optional()
});

/**
 * Product entity schema
 * Extends the base entity with product-specific properties
 */
export const productEntitySchema = baseEntitySchema.extend({
	details: z.array(entityDetailSchema).optional(),
	company: z.lazy(() => companyEntitySchema.optional())
});

// Export derived types
export type BaseEntity = z.infer<typeof baseEntitySchema>;
export type CompanyEntity = z.infer<typeof companyEntitySchema>;
export type ProductEntity = z.infer<typeof productEntitySchema>;

// Export main entity schema - can be used for general entity validation
export const entitySchema = z.union([companyEntitySchema, productEntitySchema]);
export type Entity = z.infer<typeof entitySchema>;

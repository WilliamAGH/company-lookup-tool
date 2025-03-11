/**
 * Base ID schema definitions
 *
 * Contains reusable ID validation schema that serve as building blocks
 * for domain-specific schema throughout the application.
 *
 * Make sure we accept all UUID formats, but only create UUIDs using the v7 format or later
 * @module
 */

import { z } from 'zod';

/**
 * UUID validation schema
 *
 * @example
 * const result = uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
 */
export const uuidSchema = z.string().uuid();

/**
 * Nullable UUID validation schema
 *
 * @example
 * const result = nullableUuidSchema.safeParse(null);
 */
export const nullableUuidSchema = uuidSchema.nullable();

/**
 * Optional UUID validation schema
 *
 * @example
 * const result = optionalUuidSchema.safeParse(undefined);
 */
export const optionalUuidSchema = uuidSchema.optional();

/**
 * UUID type derived from schema
 */
export type UUID = z.infer<typeof uuidSchema>;

/**
 * ID schema for numeric IDs
 * Used for entities with numeric primary keys
 */
export const numericIdSchema = z.number().int().positive();
export type NumericID = z.infer<typeof numericIdSchema>;

/**
 * Slug schema for URL-friendly identifiers
 * Used for entities that are referenced in URLs
 */
export const slugSchema = z
	.string()
	.min(1)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export type Slug = z.infer<typeof slugSchema>;

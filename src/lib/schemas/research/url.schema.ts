/**
 * URL Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity URLs
 * used throughout the application. These schemas define the web links
 * for companies, products, and related entities.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity URL types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/url.ts - Server-side database schema
 */

import { z } from 'zod';
import { numericIdSchema, optionalUuidSchema } from '$lib/schemas/base/id.schema';

/**
 * Valid URL types (verified from database)
 *
 * Notes:
 * - Primary types from res_web_url_new table: angellist, crunchbase, facebook, github, linkedin,
 *   theorg, twitter, website, wikipedia, ycombinator
 * - Additional types from res_web_url table: instagram, datanyze, dealroom, pitchbook,
 *   and many others (each as a separate column)
 */
export const urlTypes = [
	'angellist',
	'crunchbase',
	'facebook',
	'github',
	'instagram',
	'linkedin',
	'theorg',
	'twitter',
	'website',
	'wikipedia',
	'ycombinator',
	'other'
] as const;

/**
 * URL type enum
 */
export const urlTypeEnum = z.enum(urlTypes);
export type UrlType = z.infer<typeof urlTypeEnum>;

/**
 * Entity object types
 * Note: Only 'entity' currently exists in the DB
 */
export const resObjectTypes = ['entity', 'fund', 'person', 'hybrid'] as const;
export const resObjectEnum = z.enum(resObjectTypes);
export type ResObjectType = z.infer<typeof resObjectEnum>;

/**
 * URL status codes and states
 * Including common HTTP status codes and custom states
 */
export const urlStatuses = [
	'200',
	'301',
	'302',
	'400',
	'401',
	'403',
	'404',
	'500',
	'502',
	'503',
	'504',
	'Domain For Sale',
	'No Response',
	'Redirect Loop',
	'Unknown'
] as const;

/**
 * URL status enum
 */
export const urlStatusEnum = z.enum(urlStatuses);
export type UrlStatus = z.infer<typeof urlStatusEnum>;

/**
 * Simple entity URL schema
 * Used in API responses
 */
export const entityUrlSchema = z.object({
	url_type: z.string(),
	url: z.string(),
	is_primary: z.boolean().optional()
});

/**
 * Complete entity URL schema
 * Maps directly to database table structure
 * Using snake_case to match database column names directly
 */
export const entityWebUrlSchema = z.object({
	id: numericIdSchema.optional(),
	url_type: urlTypeEnum,
	url: z.string(),
	res_object: resObjectEnum.nullable().optional(),
	status: z.string().nullable().optional(), // Using string instead of enum to handle all possible status codes
	status_checked: z.string().datetime().nullable().optional(),
	is_current: z.boolean().optional(),
	is_primary: z.boolean().optional(),
	entity_id: optionalUuidSchema,
	fund_id: optionalUuidSchema,
	person_id: optionalUuidSchema,
	source_id: optionalUuidSchema,
	updated_at: z.string().datetime().optional(),
	created_at: z.string().datetime().optional()
});

/**
 * Types derived from schemas
 */
export type EntityUrl = z.infer<typeof entityUrlSchema>;
export type EntityWebUrl = z.infer<typeof entityWebUrlSchema>;

/**
 * Entity detail Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity detail structures
 * used throughout the application. These schemas define the metadata model for
 * storing various metrics and attributes about companies and products.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity detail types. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/entity_detail.ts - Server-side database schema
 */

import { z } from 'zod';
import { dataConfidenceEnum, sourceTypeEnum, typeResearchDetailEnum } from './detail_enums.schema';

/**
 * Entity detail schema for storing metadata about entities
 * Using snake_case to match database column names directly
 */
export const entityDetailSchema = z.object({
	id: z.number().int().positive().optional(),
	entity_id: z.string().uuid().optional(),
	type_research_detail: typeResearchDetailEnum,
	data_confidence: dataConfidenceEnum,
	source_type: sourceTypeEnum,
	as_of_date: z.string().datetime().optional(),
	discrete_value: z.number().optional(),
	text_value: z.string().optional(),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional(),
	source: z.string().optional(),
	source_url: z.string().url().optional(),
	source_date: z.string().datetime().optional(),
	notes: z.string().optional()
});

/**
 * Range estimates schema (min/max values)
 */
export const estimatedRangeSchema = z.object({
	min: z.number(),
	max: z.number()
});

// Export derived types
export type EntityDetail = z.infer<typeof entityDetailSchema>;
export type EstimatedRange = z.infer<typeof estimatedRangeSchema>;

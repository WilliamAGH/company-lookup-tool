/**
 * Database interfaces derived from Zod schemas
 *
 * This file defines database interfaces for Kysely based directly on our Zod schemas
 * following the schema-first DRY pattern. Types are derived from Zod schemas
 * to ensure complete alignment between validation and database operations.
 *
 * @link $lib/schemas/research/entity.schema.ts - Source of truth schema
 * @link $lib/server/db/kysely.ts - Kysely database instance
 */

import { browser } from '$app/environment';

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

// Import types from Zod schemas
import type { BaseEntity } from '$lib/schemas/research/entity.schema';

/**
 * Database schema for Kysely
 *
 * This interface maps our Zod schema types to database tables.
 * Table and column names use snake_case to match database conventions.
 */
export interface Database {
	research: {
		// Table name matches database table
		res_entity: BaseEntity;
		// Additional tables will be added here as schemas are migrated
	};
}

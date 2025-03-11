/**
 * Shared text functionality for research API endpoints
 *
 * This module provides functions to retrieve and process text data
 * from the research database schema.
 *
 * @database PostgreSQL
 * @schema research
 * @tables res_text_new
 * @link ../company/+server.ts Company API endpoint using this functionality
 * @link ../../company/[slug]/+page.server.ts Company page server load function using this functionality
 * @link $lib/schemas/research/text.schema.ts - Source of truth schema
 */

import db from '$lib/server/db';
import type { EntityText } from '$lib/schemas/research';

// Re-export the EntityText type from the central schema
export type { EntityText };

/**
 * Retrieves text data for a specific entity
 *
 * @param entityId UUID of the entity to retrieve text for
 * @returns Array of text records associated with the entity
 */
export async function getEntityTextData(entityId: string): Promise<EntityText[]> {
	// Use our textQueries to fetch data consistently with proper typing
	return db.text.getEntityTextData(entityId);
}

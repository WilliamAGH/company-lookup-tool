/**
 * Database module exports
 *
 * This file serves as the central export point for all database-related
 * functionality, following the DRY principle. It re-exports the SQL client,
 * query builders, and any other database utilities in a centralized way.
 *
 * @link $lib/schemas/research/ - Source of truth schemas for all database entities
 */

import { browser } from '$app/environment';

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

// Export SQL client
export * from '../../database/sql.server';

// Import and export query builders
import { entityQueries } from './queries/entity';
import { entityDetailQueries } from './queries/entity_detail';
import { typeRefQueries } from './queries/type_ref';
import { textQueries } from './queries/text';
import { urlQueries } from './queries/url';
export { entityQueries, entityDetailQueries, typeRefQueries, textQueries, urlQueries };

/**
 * DB module for centralized imports
 *
 * @example
 * ```typescript
 * import db from '$lib/server/db';
 *
 * // Now use the imported functionality
 * const entity = await db.entity.getById('some-uuid');
 * ```
 */
const db = {
	// Entity queries
	entity: entityQueries,

	// Entity detail queries
	entityDetail: entityDetailQueries,

	// Type reference and entity join queries
	typeRef: typeRefQueries,

	// Text data queries
	text: textQueries,

	// URL data queries
	url: urlQueries
};

export default db;

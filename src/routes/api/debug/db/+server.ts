/**
 * SERVER-SIDE DEBUG API ENDPOINT (.ts)
 *
 * This file provides an API endpoint for database debugging.
 * This is a server-only endpoint and should never be imported by client-side code.
 *
 * Related modules:
 * @link src/lib/utils/debug.client.ts - Client-side debug utilities (use this in client code)
 * @link src/lib/server/db/index.ts - Server database connection
 */
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { sql, entityQueries } from '$lib/server/db';

/**
 * Get diagnostic information about the database
 * @param schema Optional schema name to check for tables
 * @returns Debug information object
 */
async function getDatabaseDebugInfo(schema?: string) {
	try {
		// Get all schemas
		const schemas = await sql`
      SELECT schema_name 
      FROM information_schema.schemata
      ORDER BY schema_name
    `;

		// Get all tables in the specified schema
		let tables = null;
		if (schema) {
			tables = await sql`
        SELECT table_name, table_schema
        FROM information_schema.tables 
        WHERE table_schema = ${schema}
        ORDER BY table_name
      `;
		}

		// Test our entity queries to ensure they're working
		let entityTest = null;
		try {
			// Attempt to get the first entity
			const testEntity = await entityQueries.list(1, 0);
			entityTest = {
				success: true,
				count: testEntity.length,
				sample:
					testEntity.length > 0
						? {
								id: testEntity[0].id,
								name: testEntity[0].name_brand
							}
						: null
			};
		} catch (entityError) {
			entityTest = {
				success: false,
				error: entityError instanceof Error ? entityError.message : String(entityError)
			};
		}

		return {
			success: true,
			message: 'Debug information retrieved successfully',
			schemas,
			tables,
			entityTest,
			connection: 'Bun SQL connection working'
		};
	} catch (error) {
		console.error('Error getting debug info:', error);
		return {
			success: false,
			error: 'Database error during diagnostic check',
			details: error instanceof Error ? error.message : String(error)
		};
	}
}

/**
 * Debug endpoint to check database schema information
 *
 * @route GET /api/debug/db
 */
export async function GET(event: RequestEvent) {
	// Get the schema param or default to 'research'
	const schema = event.url.searchParams.get('schema') || 'research';

	// Check for pretty formatting preference
	const pretty = event.url.searchParams.get('pretty') !== 'false';

	// Get debug information
	const debugInfo = await getDatabaseDebugInfo(schema);

	// Return formatted or unformatted response based on preference
	if (pretty) {
		return new Response(JSON.stringify(debugInfo, null, 2), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} else {
		return json(debugInfo);
	}
}

import { json } from '@sveltejs/kit';

// Verify database connection using proper query builder pattern
export async function GET() {
	try {
		// Use dynamic import to isolate Bun dependency
		const { entityQueries } = await import('$lib/database/sql.server');
		const result = await entityQueries.testConnection();

		return json(result);
	} catch (error) {
		return json(
			{
				error: error instanceof Error ? error.message : 'Database unavailable'
			},
			{ status: 503 }
		);
	}
}

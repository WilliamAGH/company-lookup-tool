import { json } from '@sveltejs/kit';

/**
 * Health check endpoint for container orchestration and monitoring
 *
 * @route GET /api/health
 * @returns Simple health status with uptime
 */
export async function GET() {
	const startTime = process.uptime();

	return json(
		{
			status: 'ok',
			uptime: `${startTime.toFixed(2)}s`,
			timestamp: new Date().toISOString()
		},
		{
			headers: {
				'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
				Pragma: 'no-cache',
				Expires: '0'
			}
		}
	);
}

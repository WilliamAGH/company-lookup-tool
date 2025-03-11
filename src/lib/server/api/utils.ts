/**
 * SERVER-SIDE API UTILITIES
 *
 * This file provides server-only utilities for consistent API response handling.
 * Contains utilities for formatting responses, error handling, and API wrapping.
 *
 * @link src/routes/api/debug/db/+server.ts - Database debug endpoint (separate functionality)
 * @link src/routes/api/rest/v1/research/company/+server.ts - Example API using these utilities
 */
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Standard API response format
 */
type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: string;
	details?: string;
	example?: string;
};

/**
 * Create a successful response
 * @param data The data to include in the response
 * @param event Optional RequestEvent to check for pretty formatting
 * @returns JSON response with 200 status
 */
export function successResponse<T>(data: T, event?: RequestEvent) {
	// Default to pretty formatting unless explicitly set to false
	const pretty = event?.url.searchParams.get('pretty') !== 'false';

	if (pretty) {
		// Manual implementation for pretty printing
		return new Response(JSON.stringify({ success: true, data }, null, 2), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} else {
		// Use regular json function for non-pretty output
		return json({
			success: true,
			data
		} satisfies ApiResponse<T>);
	}
}

/**
 * Create an error response
 * @param error Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @param example Example of correct usage
 * @param event Optional RequestEvent to check for pretty formatting
 * @returns JSON response with the specified status
 */
export function errorResponse(
	error: string,
	status = 400,
	details?: string,
	example?: string,
	event?: RequestEvent
) {
	// Default to pretty formatting unless explicitly set to false
	const pretty = event?.url.searchParams.get('pretty') !== 'false';
	const response: ApiResponse = {
		success: false,
		error
	};

	if (details) response.details = details;
	if (example) response.example = example;

	if (pretty) {
		// Manual implementation for pretty printing
		return new Response(JSON.stringify(response, null, 2), {
			status,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} else {
		// Use regular json function for non-pretty output
		return json(response, { status });
	}
}

/**
 * Handle missing required parameters
 * @param paramName Name of the required parameter
 * @param example Example usage
 * @param event Optional RequestEvent to check for pretty formatting
 * @returns JSON error response with 400 status
 */
export function missingParamError(paramName: string, example: string, event?: RequestEvent) {
	return errorResponse(`Missing required parameter: ${paramName}`, 400, undefined, example, event);
}

/**
 * Handle not found errors
 * @param resource The resource that wasn't found
 * @param event Optional RequestEvent to check for pretty formatting
 * @returns JSON error response with 404 status
 */
export function notFoundError(resource: string, event?: RequestEvent) {
	return errorResponse(`${resource} not found`, 404, undefined, undefined, event);
}

/**
 * Handle internal server errors
 * @param error The error object
 * @param event Optional RequestEvent to check for pretty formatting
 * @returns JSON error response with 500 status
 */
export function serverError(error: unknown, event?: RequestEvent) {
	console.error('Server error:', error);
	return errorResponse(
		'Internal server error',
		500,
		error instanceof Error ? error.message : String(error),
		undefined,
		event
	);
}

/**
 * Higher-order function to wrap API handlers with standard error handling
 * @param handler The API handler function
 * @returns A wrapped handler with try/catch and standard error handling
 */
export function apiHandler<T>(handler: (event: RequestEvent) => Promise<T>) {
	return async (event: RequestEvent) => {
		try {
			// Check for debug mode (only on server-side)
			const isDebugMode = event.url.searchParams.get('debug') === 'true';
			if (isDebugMode) {
				// Redirect to the dedicated debug endpoint
				return new Response(null, {
					status: 302,
					headers: {
						Location: `/api/debug/db?schema=research&${new URLSearchParams(
							Object.fromEntries(event.url.searchParams.entries())
						).toString()}`
					}
				});
			}

			// Execute the handler
			return await handler(event);
		} catch (error) {
			return serverError(error, event);
		}
	};
}

/**
 * Validate UUID format
 * @param id The UUID string to validate
 * @returns true if valid, false otherwise
 */
export function isValidUuid(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}

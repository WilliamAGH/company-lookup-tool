/**
 * S3 LOGO PROXY ROUTE HANDLER
 *
 * CRITICAL: This route is essential for the application to properly serve images from S3.
 * It intercepts requests to /logos/* which would otherwise result in 404 errors.
 *
 * DO NOT MODIFY OR REMOVE THIS FILE unless you fully understand the S3 image system.
 *
 * @link src/lib/utils/imagesS3.server.ts - S3 client and utility functions
 * @link src/hooks.server.ts - S3 client initialization
 * @link src/lib/constants/placeholders.ts - Fallback image definitions
 * @link src/lib/components/Image.svelte - Component that displays images with fallbacks
 * @link README.md - Documentation about the S3 image system
 *
 * How it works:
 * 1. Requests to /logos/* are caught by this route handler instead of being treated as static files
 * 2. The handler checks if the image exists in S3 using the imageExists function
 * 3. If found, it proxies the image content instead of redirecting (avoiding CORS issues)
 * 4. If not found, it serves a placeholder image
 *
 * Common issues:
 * - 404 errors for logo images usually indicate this route is not working
 * - Ensure S3 credentials are properly configured in environment variables
 * - Check that S3 client initialization in hooks.server.ts is successful
 */

// Import only what we need (remove env imports that cause linter errors)
import { getImageUrl, imageExists } from '$lib/utils/imagesS3.server';
import { PLACEHOLDERS } from '$lib/constants/placeholders';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

/**
 * Server-side logo route handler
 *
 * This handler serves as a proxy for S3 images used by the application.
 * It takes requests to /logos/* paths and proxies the image content directly,
 * avoiding CORS issues with browser redirects.
 */
export const GET: RequestHandler = async ({ params, fetch, setHeaders }: RequestEvent) => {
	try {
		const { path } = params;

		console.log('DEBUG: Logo proxy route handler called with path:', path);

		if (!path) {
			console.log('DEBUG: No path provided, redirecting to placeholder');
			// Redirect to placeholder if no path provided
			return new Response(null, {
				status: 302,
				headers: { Location: PLACEHOLDERS.COMPANY_LOGO }
			});
		}

		// Construct the S3 path from the request path
		const originalPath = path;
		const s3ImagePath = path.startsWith('logos/') ? path : `logos/${path}`;
		console.log('DEBUG: Logo path handling:', {
			originalPath,
			s3ImagePath,
			withoutLeadingSlash: path.startsWith('/') ? path.substring(1) : path,
			PUBLIC_IMAGE_BASE_URL: publicEnv.PUBLIC_IMAGE_BASE_URL
		});

		// Check if the image exists in S3
		console.log('DEBUG: Checking if image exists in S3');
		const exists = await imageExists(s3ImagePath);
		console.log('DEBUG: Image exists in S3:', exists);

		if (!exists) {
			console.warn(`Image not found in S3: ${s3ImagePath}`);
			// Redirect to a placeholder image
			return new Response(null, {
				status: 302,
				headers: { Location: PLACEHOLDERS.COMPANY_LOGO }
			});
		}

		// Get the full S3 URL
		const imageUrl = getImageUrl(s3ImagePath);
		console.log('DEBUG: Full S3 URL:', imageUrl);

		// Fetch the actual image content instead of redirecting
		console.log('DEBUG: Fetching image content');
		const imageResponse = await fetch(imageUrl);
		console.log('DEBUG: Image fetch response status:', imageResponse.status);

		if (!imageResponse.ok) {
			console.warn(`Failed to fetch image from S3: ${imageUrl}`);
			return new Response(null, {
				status: 302,
				headers: { Location: PLACEHOLDERS.COMPANY_LOGO }
			});
		}

		// Get content type from the response
		const contentType = imageResponse.headers.get('Content-Type');
		console.log('DEBUG: Content-Type:', contentType);

		// Set appropriate cache headers
		setHeaders({
			'Cache-Control': 'public, max-age=86400',
			'Content-Type': contentType || 'image/png' // Default to PNG if type not available
		});

		// Return the image content directly
		return new Response(imageResponse.body, {
			status: 200,
			headers: {
				'Content-Type': contentType || 'image/png',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	} catch (err) {
		console.error('Error serving logo image:', err);
		// Redirect to placeholder on error
		return new Response(null, {
			status: 302,
			headers: { Location: PLACEHOLDERS.COMPANY_LOGO }
		});
	}
};

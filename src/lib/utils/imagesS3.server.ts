/**
 * SERVER-SIDE S3 IMAGE HANDLING
 *
 * This module provides server-side utilities for working with images stored in S3-compatible storage.
 * It includes functions for initializing the S3 client, generating URLs, checking image existence,
 * and normalizing image paths.
 *
 * The .server.ts extension is used because this file needs to be imported outside the server directory.
 *
 * Related modules:
 * @link src/lib/utils/imagesS3.client.ts - Client-side companion utilities
 * @link src/lib/constants/placeholders.ts - Placeholder image definitions
 * @link src/hooks.server.ts - S3 client initialization
 */

import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { PLACEHOLDERS } from '$lib/constants/placeholders';
// Add type-only imports for TypeScript resolution
import type { S3Client as S3ClientType } from '@aws-sdk/client-s3';
import type { GetObjectCommandInput } from '@aws-sdk/client-s3';

// Reference our server-side type declarations
// @link src/lib/types/aws-sdk.d.ts

/**
 * Type-safe interface for S3 client configuration
 *
 * This interface lets us define the shape of the S3 client options
 * without requiring the actual AWS SDK to be imported directly.
 * It's used for type checking only.
 */
// interface S3ClientOptions {
// 	endpoint?: string;
// 	region?: string;
// 	credentials?: {
// 		accessKeyId: string;
// 		secretAccessKey: string;
// 	};
// 	forcePathStyle?: boolean;
// }

/**
 * Lazy-loaded S3 client instance
 *
 * We use a lazy loading pattern for the AWS SDK to:
 * 1. Avoid loading the AWS SDK unless it's actually needed
 * 2. Keep the SDK out of client bundles (server-side only)
 * 3. Provide graceful degradation if S3 is unavailable
 * 4. Allow dynamic imports instead of static requires
 *
 * The client starts as null and is initialized by calling initializeS3Client()
 * which should happen in hooks.server.ts during app initialization.
 *
 * @see initializeS3Client
 */
let s3Client: S3ClientType | null = null;

/**
 * Initialize the S3 client with the AWS SDK
 *
 * This function should be called during app initialization in hooks.server.ts
 * It dynamically imports the AWS SDK to ensure it's only loaded on the server.
 * If initialization fails, the app will continue running but will use
 * placeholder images instead of S3 images.
 *
 * @see src/hooks.server.ts for usage
 */
export async function initializeS3Client(): Promise<void> {
	try {
		// Dynamically import the S3 SDK using ESM dynamic import
		const { S3Client } = await import('@aws-sdk/client-s3');

		// Use hardcoded defaults instead of disabled environment variables
		s3Client = new S3Client({
			endpoint: env.S3_ENDPOINT,
			region: 'us-east-1', // Hardcoded default instead of env.S3_REGION
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY,
				secretAccessKey: env.S3_SECRET_KEY
			},
			forcePathStyle: true // Hardcoded default instead of env.S3_FORCE_PATH_STYLE
		});

		console.log('S3 client initialized successfully');
	} catch (error) {
		console.warn('Failed to initialize S3 client. Image functionality will be limited:', error);
		// Allow the app to continue without S3 capabilities
	}
}

/**
 * Get a public URL for an image file path
 *
 * @param imagePath - The image path from the API response
 * @param options - Optional configuration
 * @returns URL string for the image
 */
export function getImageUrl(
	imagePath: string | null | undefined,
	options: {
		size?: number;
		useSignedUrl?: boolean;
		expiration?: number;
		placeholder?: keyof typeof PLACEHOLDERS | string;
	} = {}
): string {
	// If no image path provided, return placeholder
	if (!imagePath) {
		// If placeholder is specified and exists in PLACEHOLDERS
		if (
			options.placeholder &&
			typeof options.placeholder === 'string' &&
			options.placeholder in PLACEHOLDERS
		) {
			return PLACEHOLDERS[options.placeholder as keyof typeof PLACEHOLDERS];
		}
		// If it's a direct path
		if (options.placeholder && typeof options.placeholder === 'string') {
			return options.placeholder;
		}
		// Default to company logo placeholder
		return PLACEHOLDERS.COMPANY_LOGO;
	}

	// Handle absolute URLs (might be already full URLs in the database)
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		return imagePath;
	}

	// Remove leading slash if present to avoid double slashes
	const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

	// Always use public URLs in synchronous context - hardcoded to false
	// Removed check for publicEnv.PUBLIC_USE_SIGNED_URLS
	if (options.useSignedUrl && s3Client) {
		console.warn('Signed URLs are not supported in synchronous context');
		// For client-side usage, you would need to fetch the signed URL from a server endpoint
	}

	// Otherwise just join the base URL with the path
	const baseUrl =
		publicEnv.PUBLIC_IMAGE_BASE_URL ||
		(env.S3_ENDPOINT && env.S3_BUCKET_NAME ? `${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}` : '');

	return `${baseUrl.replace(/\/$/, '')}/${cleanPath}`;
}

/**
 * Generate a signed URL for private S3 resources - Async version
 * This should be called from a server endpoint, not directly in components
 *
 * @param imagePath - The path to the image in the bucket
 * @param expiration - Expiration time in seconds (defaults to 3600)
 * @returns A promise that resolves to a pre-signed URL
 */
export async function getSignedImageUrlAsync(
	imagePath: string,
	expiration?: number
): Promise<string> {
	if (!s3Client) {
		console.warn('S3 client not initialized. Cannot generate signed URL.');
		return PLACEHOLDERS.COMPANY_LOGO;
	}

	try {
		// Use dynamic imports instead of require
		const { GetObjectCommand } = await import('@aws-sdk/client-s3');
		const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

		// Use hardcoded default for expiration
		const expiresIn = expiration || 3600; // 1 hour default

		const command = new GetObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: imagePath
		} as GetObjectCommandInput);

		return await getSignedUrl(s3Client, command, { expiresIn });
	} catch (error) {
		console.error('Error generating signed URL:', error);
		return PLACEHOLDERS.COMPANY_LOGO;
	}
}

/**
 * Check if an image exists in the S3 bucket
 *
 * @param imagePath - Path to the image in the bucket
 * @returns True if the image exists, false otherwise
 */
export async function imageExists(imagePath: string): Promise<boolean> {
	if (!s3Client) {
		console.warn('S3 client not initialized. Cannot check if image exists.');
		return false;
	}

	try {
		// Use dynamic import instead of require
		const { GetObjectCommand } = await import('@aws-sdk/client-s3');

		const command = new GetObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
		} as GetObjectCommandInput);

		await s3Client.send(command);
		return true;
	} catch (error) {
		console.error('Error checking if image exists:', error);
		return false;
	}
}

/**
 * Normalize and format image paths from the database
 *
 * @param filePath - Raw file path from the database
 * @returns Normalized path for use with S3
 */
export function normalizeImagePath(filePath: string | null | undefined): string | null {
	if (!filePath) return null;

	// Already normalized
	if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
		return filePath;
	}

	// Ensure path starts with a slash for consistency
	if (!filePath.startsWith('/')) {
		return `/${filePath}`;
	}

	return filePath;
}

/**
 * Create a client-side image URL from a server file path
 * Safe to use in browser components
 *
 * @param imagePath - Path from the database
 * @returns Public URL to display the image
 */
export function getPublicImageUrl(imagePath: string | null | undefined): string {
	if (!imagePath) {
		return PLACEHOLDERS.COMPANY_LOGO;
	}

	// Handle absolute URLs
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		return imagePath;
	}

	// Remove leading slash if present
	const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

	// Construct the full URL
	const baseUrl = publicEnv.PUBLIC_IMAGE_BASE_URL || '';
	return `${baseUrl.replace(/\/$/, '')}/${cleanPath}`;
}

/**
 * Retrieve an image directly from S3
 *
 * This function fetches the raw image data from S3, which can then be processed
 * or transformed before sending to the client.
 *
 * @param imagePath - Path to the image in the bucket
 * @returns The S3 GetObject response or null if not found
 */
export async function getImageFromS3(imagePath: string) {
	if (!s3Client) {
		console.warn('S3 client not initialized. Cannot fetch image.');
		return null;
	}

	try {
		// Use dynamic import instead of require
		const { GetObjectCommand } = await import('@aws-sdk/client-s3');

		const command = new GetObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
		} as GetObjectCommandInput);

		return await s3Client.send(command);
	} catch (error) {
		console.error('Error fetching image from S3:', error);
		return null;
	}
}

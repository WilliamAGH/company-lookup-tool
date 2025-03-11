/**
 * CLIENT-SIDE IMAGE HANDLING (.client.ts)
 *
 * This module provides client-side utilities for working with images in the application.
 * It includes functions for generating image URLs, handling image loading errors,
 * and working with responsive images.
 *
 * The .client.ts extension explicitly marks this as client-only code. These utilities
 * are designed to be used in client-side components to display images from our
 * S3-compatible storage system with proper fallbacks and error handling.
 *
 * Related modules:
 * @link src/lib/utils/imagesS3.server.ts - Server-side S3 utilities
 * @link src/lib/constants/placeholders.ts - Placeholder image definitions
 */

import { env } from '$env/dynamic/public';
import { PLACEHOLDERS, getPlaceholder } from '$lib/constants/placeholders';
import { debugLog } from '$lib/utils/debug.client';

// Debug - log the environment variables
debugLog('$env values in imagesS3.client.ts', {
	PUBLIC_IMAGE_BASE_URL: env.PUBLIC_IMAGE_BASE_URL
});

/**
 * Generate a public URL for an image using the configured base URL
 *
 * This client-side function creates properly formatted image URLs for use
 * in <img> tags and handles placeholders when images are missing.
 *
 * @param imagePath - The image path from the database
 * @param options - Additional options for the image URL
 * @returns A complete URL to the image or appropriate placeholder
 *
 * @example
 * <img src={getImageUrl(company.fileLogoSquare)} alt="Company logo" />
 */
export function getImageUrl(
	imagePath: string | null | undefined,
	options: {
		size?: number;
		placeholder?: keyof typeof PLACEHOLDERS | string;
	} = {}
): string {
	// Debug - log input parameters
	debugLog('getImageUrl input', { imagePath, options });

	// Handle placeholder for empty paths
	if (!imagePath) {
		// If placeholder is a key in our PLACEHOLDERS object, use that
		if (
			options.placeholder &&
			typeof options.placeholder === 'string' &&
			options.placeholder in PLACEHOLDERS
		) {
			return getPlaceholder(options.placeholder as keyof typeof PLACEHOLDERS);
		}
		// If it's a direct path string, use that
		if (options.placeholder && typeof options.placeholder === 'string') {
			return options.placeholder;
		}
		// Default to company logo placeholder
		return PLACEHOLDERS.COMPANY_LOGO;
	}

	// If it's already a complete URL, return it as is
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		debugLog('Already a complete URL', imagePath);
		return imagePath;
	}

	// Remove leading slash to avoid double slashes in the URL
	const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

	// Construct the full URL
	const baseUrl = env.PUBLIC_IMAGE_BASE_URL || '';
	const finalUrl = `${baseUrl.replace(/\/$/, '')}/${cleanPath}`;

	// Debug - log the constructed URL
	debugLog('getImageUrl result', {
		baseUrl,
		cleanPath,
		finalUrl
	});

	return finalUrl;
}

/**
 * Handle image loading errors by setting a fallback image
 *
 * @param event - The error event from the image
 * @param fallbackType - The type of placeholder to use (from PLACEHOLDERS), or direct path
 */
export function handleImageError(
	event: Event,
	fallbackType: keyof typeof PLACEHOLDERS | string = 'COMPANY_LOGO'
): void {
	const img = event.target as HTMLImageElement;

	// Determine the fallback source
	let fallbackSrc: string;

	// If it's a key in our PLACEHOLDERS object
	if (fallbackType in PLACEHOLDERS) {
		fallbackSrc = getPlaceholder(fallbackType as keyof typeof PLACEHOLDERS);
	} else {
		// Otherwise treat it as a direct path
		fallbackSrc = fallbackType;
	}

	// Only update if not already using the fallback
	if (img.src !== fallbackSrc) {
		img.src = fallbackSrc;
	}
}

/**
 * Create an image URL with support for responsive sizes
 *
 * @param imagePath - The base image path
 * @param width - Desired width for the image
 * @returns URL with size parameters if supported
 */
export function getResponsiveImageUrl(
	imagePath: string | null | undefined,
	width: number = 150 // Default thumbnail size hardcoded to 150px
): string {
	const url = getImageUrl(imagePath);

	// If no width specified or URL already has parameters, return as is
	if (width === 0 || url.includes('?')) {
		return url;
	}

	// For services like Cloudinary, Imgix, etc. that support on-the-fly resizing
	// Implement the specific URL format needed by your image service
	// This is a simple example:
	return `${url}?width=${width}`;
}

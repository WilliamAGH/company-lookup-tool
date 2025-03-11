/**
 * CLIENT-SIDE IMAGE STORAGE UTILITIES (.client.ts)
 *
 * This module provides client-side utilities for accessing images stored in
 * S3-compatible storage. It includes functions for building image URLs,
 * handling fallbacks, and checking image existence.
 *
 * The .client.ts extension explicitly marks this as client-only code.
 *
 * Related modules:
 * @link src/lib/utils/imagesS3.client.ts - Additional client-side image utilities
 * @link src/lib/constants/placeholders.ts - Placeholder image definitions
 * @link src/lib/utils/imagesS3.server.ts - Server-side S3 utilities
 */

// Get the image base URL from environment variable
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL || '';

/**
 * Default images to use as fallbacks when an image is missing
 */
export const DEFAULT_IMAGES = {
	COMPANY_LOGO: '/images/placeholders/no-company.svg',
	FAVICON: '/images/placeholders/no-company.svg',
	PLACEHOLDER: '/images/placeholders/no-avatar.svg',
	PROFILE: '/images/placeholders/no-avatar.svg',
	NEWS: '/images/placeholders/no-news.svg'
};

/**
 * Interface for image metadata
 */
export interface ImageMetadata {
	filePath: string | null;
	altText?: string;
	width?: number;
	height?: number;
}

/**
 * Interface for image object
 */
export interface ImageObject {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	isDefault: boolean;
}

/**
 * Get a complete URL for an image stored in S3
 *
 * @param filePath - The file path from the database
 * @param defaultImage - Default image to use if filePath is null
 * @returns Full URL to the image or default image
 */
export function getImageUrl(filePath: string | null, defaultImage?: string): string {
	// Return default image if filePath is null or empty
	if (!filePath) {
		return defaultImage || DEFAULT_IMAGES.PLACEHOLDER;
	}

	// If it's already an absolute URL, return it as is
	if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
		return filePath;
	}

	// Make sure the path doesn't start with a slash when connecting to base URL
	const path = filePath.startsWith('/') ? filePath.substring(1) : filePath;

	// Combine the base URL with the path
	return `${IMAGE_BASE_URL.replace(/\/+$/, '')}/${path}`;
}

/**
 * Get a URL for a company logo with fallback
 *
 * @param logoPath - Path to the logo from database
 * @returns URL to the logo or default company logo
 */
export function getCompanyLogoUrl(logoPath: string | null): string {
	return getImageUrl(logoPath, DEFAULT_IMAGES.COMPANY_LOGO);
}

/**
 * Get a URL for a company favicon with fallback
 *
 * @param faviconPath - Path to the favicon from database
 * @returns URL to the favicon or default favicon
 */
export function getCompanyFaviconUrl(faviconPath: string | null): string {
	return getImageUrl(faviconPath, DEFAULT_IMAGES.FAVICON);
}

/**
 * Create an image object with URL and alt text
 *
 * @param metadata - Image metadata (path, alt text, dimensions)
 * @param defaultImage - Default image path if metadata.filePath is null
 * @returns Object with image URL and properties
 */
export function createImageObject(metadata: ImageMetadata, defaultImage?: string): ImageObject {
	const { filePath, altText = '', width, height } = metadata;

	const url = getImageUrl(filePath, defaultImage);

	return {
		src: url,
		alt: altText,
		width: width !== undefined ? width : undefined,
		height: height !== undefined ? height : undefined,
		isDefault: !filePath || filePath.length === 0
	};
}

/**
 * Create a srcset attribute for responsive images
 *
 * @param filePath - The base image path
 * @param sizes - Array of image widths to include in srcset
 * @returns srcset string or null if filePath is null
 */
export function createImageSrcset(
	filePath: string | null,
	sizes: number[] = [300, 600, 900]
): string | null {
	if (!filePath) return null;

	// If it's already a complete URL, use it as the base
	let baseUrl = filePath;
	if (!filePath.startsWith('http')) {
		// Make sure path doesn't start with slash
		const path = filePath.startsWith('/') ? filePath.substring(1) : filePath;
		baseUrl = `${IMAGE_BASE_URL.replace(/\/+$/, '')}/${path}`;
	}

	// Create the srcset string with different widths
	return sizes.map((size) => `${baseUrl}?width=${size} ${size}w`).join(', ');
}

/**
 * Check if an image exists by making a HEAD request
 *
 * @param url - URL to check
 * @returns Promise that resolves to true if the image exists, false otherwise
 */
export async function checkImageExists(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		return response.ok;
	} catch (error) {
		console.error('Error checking image existence:', error);
		return false;
	}
}

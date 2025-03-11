/**
 * PLACEHOLDER IMAGE DEFINITIONS
 *
 * This module provides centralized placeholder image definitions used throughout the application.
 * These placeholders are used when actual images fail to load or are not available.
 *
 * All placeholder paths are relative to the /static directory and are used by both
 * client and server-side image utilities.
 *
 * Related modules:
 * @link src/lib/utils/imagesS3.server.ts - Server-side S3 utilities that use these placeholders
 * @link src/lib/utils/imagesS3.client.ts - Client-side utilities that use these placeholders
 */

/**
 * Placeholder image paths for use throughout the application
 * These are relative to the /static directory
 */
export const PLACEHOLDERS = {
	// Company-related placeholders
	COMPANY_LOGO: '/images/placeholders/no-company.svg',
	COMPANY_FAVICON: '/images/placeholders/no-company.svg',

	// Person and user placeholders
	PERSON: '/images/placeholders/no-avatar.svg',
	USER: '/images/placeholders/no-avatar.svg',

	// Generic placeholders
	DEFAULT: '/images/placeholders/no-company.svg'
};

/**
 * Helper function to get a placeholder with fallback to default
 *
 * @param key - The placeholder type to retrieve
 * @returns The placeholder path or the default placeholder if key not found
 */
export const getPlaceholder = (key: keyof typeof PLACEHOLDERS): string =>
	PLACEHOLDERS[key] || PLACEHOLDERS.DEFAULT;

/**
 * Default width and height for placeholder images
 * Used for sizing placeholder images appropriately in the UI
 */
export const PLACEHOLDER_SIZES = {
	COMPANY_LOGO: { width: 150, height: 150 },
	COMPANY_FAVICON: { width: 32, height: 32 },
	PERSON: { width: 100, height: 100 },
	USER: { width: 100, height: 100 }
};

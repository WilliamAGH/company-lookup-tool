/**
 * Favicon Client Utilities
 *
 * This module provides utility functions for handling company favicons in the browser.
 * It includes functions for transforming favicon URLs, updating document head elements,
 * and diagnosing favicon loading issues.
 *
 * ## Image Handling Approach:
 *
 * - Images are loaded directly from their source URLs (S3 or proxy)
 * - For non-square logos, URL parameters are added to request a square crop
 * - No physical image transformations occur client-side - all rendering is handled by the browser
 * - SVG files are used as-is with proper MIME type (image/svg+xml)
 * - Fallback chain: Direct S3 URL → Proxy URL → Default Berkeley favicon
 *
 * ## Link Element Management:
 *
 * - New favicon links are created and added to the DOM before old ones are removed
 * - This ensures a smooth transition with no "missing favicon" period
 * - Multiple sizes are supported (16x16, 32x32, 48x48) for optimal display in different contexts
 * - Apple touch icons are also managed for iOS device support
 *
 * ## SvelteKit and DOM Considerations:
 *
 * - SvelteKit doesn't actively manage favicons in the <svelte:head> during client-side navigation
 * - The favicon utilities manually modify the DOM outside of Svelte's reactivity system
 * - This is necessary because Svelte doesn't re-render <svelte:head> content for dynamic favicons
 * - We use a timeout when removing old links to avoid race conditions with browser fetching
 * - Browser caching of favicons is aggressive; we add timestamps to URLs to bypass cache
 *
 * ## Browser Caching Considerations:
 *
 * - Browsers aggressively cache favicons, even with proper Cache-Control headers
 * - We add URL parameters with timestamps to force reloads (?t=1234567890)
 * - Some browsers may still show cached favicons until a full page reload
 * - For local development, disable cache in DevTools for more predictable results
 * - Mobile devices may cache favicons even more aggressively than desktop browsers
 *
 * When viewing a company page, the favicon is updated dynamically to use the
 * company's logo, providing a more branded experience. This works in conjunction
 * with other company UI components like CompanyExternalLinks.
 *
 * @module favicon.client
 * @link src/lib/utils/imagesS3.server.ts - S3 client and utility functions
 * @link src/lib/utils/imagesS3.client.ts - Client-side image utilities
 * @link src/routes/logos/[...path]/+server.ts - Logo proxy route handler
 * @link src/routes/companies/[slug]/components/CompanyExternalLinks.svelte - Component that displays company links with relevant icons
 * @link src/routes/companies/[slug]/components/CompanyHeader/CompanyExternalLinks.svelte - Component that renders company external links and social profiles
 * @link src/routes/companies/[slug]/types.ts - Contains CompanyData interface with favicon fields
 * @link https://stackoverflow.com/questions/260857/changing-website-favicon-dynamically - Reference for dynamic favicon changes
 *
 * @example
 * // In a company page component:
 * import { loadCompanyFavicon } from '$lib/utils/favicon.client';
 *
 * onMount(() => {
 *   // Initialize favicon with company logo
 *   loadCompanyFavicon(company.logoUrl, company.slug, s3BaseUrl);
 * });
 */

/**
 * Extract the path portion from a URL
 *
 * This helper function extracts the path portion from a URL,
 * which can be used to construct proxy or transformation URLs.
 *
 * @param url - The full URL to extract path from
 * @returns The path portion of the URL or undefined if extraction fails
 */
function extractPathFromUrl(url: string): string | undefined {
	if (!url) return undefined;

	try {
		// Handle absolute URLs
		if (url.startsWith('http://') || url.startsWith('https://')) {
			const urlObj = new URL(url);
			// Remove leading slash if present
			return urlObj.pathname.replace(/^\//, '');
		}

		// Handle relative URLs - just return the path
		// Remove leading slash if present for consistency
		return url.replace(/^\//, '');
	} catch (error) {
		console.error('Error extracting path from URL:', error);
		return undefined;
	}
}

/**
 * Converts company logo URL to a proxy path
 * This helps avoid CORS issues by using our internal proxy
 *
 * @param url - The original logo URL (can be S3 or other format)
 * @returns The proxy URL for the favicon
 */
export function getProxyPath(url?: string): string | undefined {
	if (!url) return undefined;

	// Extract the relevant path part
	const pathPart = extractPathFromUrl(url);
	if (!pathPart) return undefined;

	// Return the path with the proxy prefix
	return `/${pathPart}`;
}

/**
 * Diagnoses image proportions by creating a temporary image element
 * and evaluating its dimensions after loading
 *
 * @param url - URL of the image to check
 * @param callback - Callback function that receives dimension information
 */
export function diagnoseImageProportions(
	url: string,
	callback: (dimensions: { width: number; height: number; aspectRatio: number }) => void
): void {
	// Create a temporary image to check proportions
	const img = new Image();

	img.onload = () => {
		const width = img.width;
		const height = img.height;
		const aspectRatio = width / height;

		// Call the callback with dimension information
		callback({
			width,
			height,
			aspectRatio
		});
	};

	img.onerror = () => {
		console.error(`Failed to load image for proportion check: ${url}`);
	};

	// Start loading the image
	img.src = url;
}

/**
 * Progressive favicon loading strategy
 *
 * Attempts to load a company favicon using multiple strategies:
 * 1. First checks for fileLogoFaviconSquare (pre-transformed square version)
 * 2. Falls back to direct logo URL if square version not available
 * 3. For non-square logos, creates a client-side square version using canvas
 * 4. Uses default Berkeley favicon if all other attempts fail
 *
 * @param companyData - Company data object with logo URLs
 * @param s3BaseUrl - Base URL for S3 bucket (from environment)
 */
export function loadCompanyFavicon(
	companyData: {
		logoUrl?: string;
		faviconUrl?: string;
		fileLogoSquare?: string;
		fileLogoFaviconSquare?: string;
	},
	s3BaseUrl?: string
): void {
	console.group('🖼️ Processing Company Logo for Favicon');

	// DIAGNOSTICS: Dump the full company data object with indentation
	console.log('💾 Company data structure:');
	console.log('  → logoUrl:', companyData.logoUrl);
	console.log('  → faviconUrl:', companyData.faviconUrl);
	console.log('  → fileLogoSquare:', companyData.fileLogoSquare);
	console.log('  → fileLogoFaviconSquare:', companyData.fileLogoFaviconSquare);
	console.log('  → S3 Base URL:', s3BaseUrl);

	if (
		companyData.fileLogoSquare?.includes('EDsLqVf3FMS') ||
		companyData.fileLogoSquare?.includes('EjJ4SlcBhPXmGyk0KvHgmHg')
	) {
		console.log('⚠️ SPECIAL TRACKING: Found Venturerock logo or SVG logo you mentioned!');
		console.log('   This is the non-transformed logo path, monitoring transformation process...');
	}

	// First check if we have a dedicated favicon image already
	const dedicatedFavicon = companyData.faviconUrl || companyData.fileLogoFaviconSquare;

	if (dedicatedFavicon) {
		console.log('✅ Found dedicated favicon image:', dedicatedFavicon);
		updateFaviconLinks(dedicatedFavicon);
		console.groupEnd();
		return;
	}

	// Otherwise use the logo
	const logoUrl = companyData.logoUrl || companyData.fileLogoSquare;

	if (!logoUrl) {
		console.log('No company logo URL provided, using default favicon');
		updateFaviconLinks('favicon.ico');
		console.groupEnd();
		return;
	}

	console.log('Original logo URL:', logoUrl);

	// Extract path for proxy URL
	const logoPath = extractPathFromUrl(logoUrl);
	console.log('Extracted path portion:', logoPath);

	// Generate proxy URL
	const proxyUrl = logoPath ? `/${logoPath}` : undefined;
	console.log('Generated proxy URL:', proxyUrl);

	// Create a temporary image to check proportions
	const img = new Image();

	// Set up success handler
	img.onload = () => {
		console.log('✅ Image loaded successfully:', img.src);
		const width = img.width;
		const height = img.height;
		const aspectRatio = width / height;
		console.log(`Dimensions: ${width}x${height}, Aspect ratio: ${aspectRatio}`);

		// Log target favicon sizes
		console.group('🎯 Target Favicon Sizes');
		console.log('Standard favicon sizes: 16x16, 32x32, 48x48 pixels');
		console.log('Apple touch icon size: 180x180 pixels');
		console.groupEnd();

		// Check if logo is square-ish
		if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
			console.log('Logo is approximately square, using as is');
			console.log(
				'Transformation: Browser will scale the image to target sizes without distortion'
			);
			// Update favicon links with original image
			updateFaviconLinks(img.src);
		} else {
			console.log(
				'Logo is not square (ratio: ' + aspectRatio.toFixed(2) + '), needs transformation'
			);

			// FIXED: Don't use non-square SVGs directly - convert all non-square images including SVGs
			console.log('Creating square version using canvas for non-square image...');
			createSquareFavicon(img, (squareImageUrl) => {
				console.log('✅ Created square favicon data URL');
				console.log('Size: Optimized for favicon display (32×32)');
				updateFaviconLinks(squareImageUrl);
			});
		}
		console.groupEnd();
	};

	// Set up error handler for direct logo URL
	img.onerror = () => {
		console.warn('❌ Failed to load image directly, trying proxy URL');

		if (proxyUrl) {
			// Try the proxy URL as fallback
			const fallbackImg = new Image();

			fallbackImg.onload = () => {
				console.log('✅ Image loaded successfully via proxy:', fallbackImg.src);
				const fWidth = fallbackImg.width;
				const fHeight = fallbackImg.height;
				const fAspectRatio = fWidth / fHeight;
				console.log(`Dimensions: ${fWidth}x${fHeight}, Aspect ratio: ${fAspectRatio.toFixed(2)}`);

				// Check if logo is square-ish
				if (fAspectRatio >= 0.9 && fAspectRatio <= 1.1) {
					// Square enough, use as is
					updateFaviconLinks(fallbackImg.src);
				} else {
					// FIXED: Don't use non-square SVGs directly - convert all non-square images
					console.log(
						'Non-square image (ratio: ' + fAspectRatio.toFixed(2) + '), creating square version'
					);
					// Create square version for all non-square images regardless of format
					createSquareFavicon(fallbackImg, (squareImageUrl) => {
						updateFaviconLinks(squareImageUrl);
					});
				}
				console.groupEnd();
			};

			fallbackImg.onerror = () => {
				console.error('❌ Failed to load image via proxy, using default favicon');
				console.log('Fallback to default favicon: favicon.ico');

				// Use default Berkeley favicon as final fallback
				updateFaviconLinks('favicon.ico');
				console.groupEnd();
			};

			// Try loading from proxy URL
			fallbackImg.src = proxyUrl;
		} else {
			console.error('❌ No proxy URL available, using default favicon');
			console.log('Fallback to default favicon: favicon.ico');

			// Use default Berkeley favicon
			updateFaviconLinks('favicon.ico');
			console.groupEnd();
		}
	};

	// Try loading from direct URL first
	console.log('🔄 LOADING PATH:');
	console.log('  1. Attempting direct load from:', logoUrl);
	console.log('  2. Fallback proxy path (if needed):', proxyUrl);
	console.log('  3. Last resort default:', 'favicon.ico');
	console.log('  → Client-side canvas transformation will happen ONLY for non-square images');
	console.log(
		'  → NO server-side URL transformations are happening - just loading the original URL'
	);

	img.src = logoUrl;
}

/**
 * Creates a square favicon from a non-square image
 * Uses canvas to create a properly sized square favicon with the original logo
 * preserved completely (no cropping)
 *
 * @param img - Image element with the loaded source
 * @param callback - Function to call with the square image data URL
 */
function createSquareFavicon(img: HTMLImageElement, callback: (dataUrl: string) => void): void {
	try {
		// Create a canvas for the square favicon
		const canvas = document.createElement('canvas');
		const size = 32; // Standard favicon size
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			console.error('Failed to get canvas context');
			callback(img.src); // Fallback to original
			return;
		}

		const imgWidth = img.width;
		const imgHeight = img.height;

		console.group('🔄 CLIENT-SIDE CANVAS TRANSFORMATION');
		console.log('⚠️ IMPORTANT: This transformation happens in the browser, not in the URL!');
		console.log('Original image source:', img.src);
		console.log('  - Before: Non-square image ' + `${imgWidth}x${imgHeight}`);
		console.log('  - After: Square canvas ' + `${size}x${size}`);
		console.log('  - Transformation type: Fit entire logo within square (NO CROPPING!)');

		// Clear canvas with transparent background
		ctx.clearRect(0, 0, size, size);

		// Calculate scaling to fit the entire logo while maintaining aspect ratio
		// Add padding around the image to ensure it's not too close to the edge
		const padding = size * 0.1; // 10% padding
		const availableSize = size - padding * 2;
		const scale = Math.min(availableSize / imgWidth, availableSize / imgHeight);

		const scaledWidth = imgWidth * scale;
		const scaledHeight = imgHeight * scale;

		// Center the logo in the canvas
		const offsetX = (size - scaledWidth) / 2;
		const offsetY = (size - scaledHeight) / 2;

		console.log('Improved scaling approach:');
		console.log(`  - Original dimensions: ${imgWidth}x${imgHeight}`);
		console.log(`  - Padding: ${padding.toFixed(1)}px (10% of canvas)`);
		console.log(`  - Available size: ${availableSize.toFixed(1)}x${availableSize.toFixed(1)}`);
		console.log(`  - Scaled dimensions: ${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`);
		console.log(`  - Scale factor: ${scale.toFixed(3)}`);
		console.log(`  - Centered with offset: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
		console.log('  - Background: Transparent (no background color)');
		console.log('  - ENTIRE LOGO PRESERVED - NO CROPPING');

		// Draw the image scaled and centered
		ctx.drawImage(img, 0, 0, imgWidth, imgHeight, offsetX, offsetY, scaledWidth, scaledHeight);

		// Get data URL
		const dataUrl = canvas.toDataURL('image/png');
		console.log('Generated data URL with full logo preserved');
		console.groupEnd();

		// Return the data URL
		callback(dataUrl);
	} catch (error) {
		console.error('Error creating square favicon:', error);
		callback(img.src); // Fallback to original
	}
}

/**
 * Updates favicon links in the document head
 *
 * This function updates or creates favicon links in the document head
 * It handles both standard favicons and Apple touch icons
 *
 * @param imageUrl - URL of the image to use as favicon
 */
export function updateFaviconLinks(imageUrl: string): void {
	console.group('🔄 Updating favicon links');
	console.log('Using image URL:', imageUrl);

	// Set standard favicon
	const faviconUrl = imageUrl;
	console.log('Favicon URL:', faviconUrl);

	// Set Apple touch icon
	const appleTouchIconUrl = imageUrl;
	console.log('Apple touch icon URL:', appleTouchIconUrl);

	// Add cache-busting timestamp parameter
	const timestamp = Date.now();
	const addCacheBuster = (url: string): string => {
		// Only add timestamp if it's not a data URL
		if (url.startsWith('data:')) return url;

		// Add timestamp as a query parameter to prevent caching
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}t=${timestamp}`;
	};

	const faviconUrlWithTimestamp = addCacheBuster(faviconUrl);
	const appleTouchIconUrlWithTimestamp = addCacheBuster(appleTouchIconUrl);

	console.log('Cache-busting applied:');
	console.log('- Original URL:', faviconUrl);
	console.log('- With timestamp:', faviconUrlWithTimestamp);

	// Determine image type based on URL extension
	const isSvg = faviconUrl.toLowerCase().endsWith('.svg');
	const contentType = isSvg ? 'image/svg+xml' : 'image/png';
	console.log(`Detected image type: ${contentType}`);

	// Create all new favicon links first (but don't append to DOM yet)
	const newLinks: HTMLLinkElement[] = [];

	// Create new favicon link
	const link = document.createElement('link');
	link.rel = 'icon';
	link.type = contentType;
	link.href = faviconUrlWithTimestamp;
	link.setAttribute('sizes', '32x32');
	newLinks.push(link);

	// Create Apple touch icon (Apple supports both PNG and SVG)
	const appleLink = document.createElement('link');
	appleLink.rel = 'apple-touch-icon';
	appleLink.href = appleTouchIconUrlWithTimestamp;
	appleLink.setAttribute('sizes', '180x180');
	newLinks.push(appleLink);

	// Add additional standard sizes for completeness
	const standardSizes = ['16x16', '32x32', '48x48'];
	standardSizes.forEach((size) => {
		const sizeLink = document.createElement('link');
		sizeLink.rel = 'icon';
		sizeLink.type = contentType;
		sizeLink.href = faviconUrlWithTimestamp;
		sizeLink.setAttribute('sizes', size);
		newLinks.push(sizeLink);
	});

	// Now that all new links are ready, remove old ones and add new ones
	// This minimizes the time without a favicon
	const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');

	// First add all new links to ensure they're loaded
	newLinks.forEach((newLink) => {
		document.head.appendChild(newLink);
		console.log(
			`Added new link: ${newLink.rel} (${newLink.getAttribute('sizes') || 'default'}) with type ${newLink.type}`
		);
	});

	// Log Svelte DOM info for debugging
	console.log('SvelteKit info: Dynamic favicon added directly to DOM outside of Svelte reactivity');
	console.log(
		'Favicon changes are performed via direct DOM manipulation (required for dynamic favicons)'
	);

	// After a small delay, remove old links to ensure smooth transition
	setTimeout(() => {
		existingLinks.forEach((oldLink) => {
			console.log('Removing old link:', oldLink);
			oldLink.remove();
		});
		console.log('DOM transition complete - all old links removed after new ones were loaded');
	}, 250); // Increased timeout to give more time for new favicons to load

	console.groupEnd();
}

/**
 * Restores the default Berkeley favicon
 *
 * This function should be called when navigating away from company pages
 * to restore the default site favicon.
 */
export function restoreDefaultFavicon(): void {
	console.group('🔄 Restoring default Berkeley favicon');
	updateFaviconLinks('favicon.ico');
	console.groupEnd();
}

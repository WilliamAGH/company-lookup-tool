import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getImageFromS3 } from '$lib/utils/imagesS3.server';
import sharp from 'sharp';

/**
 * Favicon transformation endpoint
 *
 * Transforms images to be suitable for favicon use:
 * - Crops to square (center crop)
 * - Resizes to specified dimensions
 * - Sets appropriate content-type
 * - Adds cache control headers
 *
 * Example usage:
 * /logos/transform/square/180/ejj/EjJ4SlcBhPXmGyk0KvHgmHg.png
 *
 * URL format: /logos/transform/:type/:size/:path
 * - type: 'square' (currently only square transformation is supported)
 * - size: size in pixels (e.g. '16', '32', '180')
 * - path: original image path (same as used in /logos/[...path])
 */
export const GET: RequestHandler = async ({ params, url, setHeaders }) => {
	try {
		// Parse path components
		const fullPath = params.path || '';
		const pathParts = fullPath.split('/');

		// Check if we have enough parts (type/size/imagePath)
		if (pathParts.length < 3) {
			throw error(400, 'Invalid transformation path format');
		}

		// Extract transformation parameters
		const transformType = pathParts[0];
		const size = parseInt(pathParts[1], 10);

		// Validate size
		if (isNaN(size) || size <= 0 || size > 512) {
			throw error(400, 'Invalid size parameter (must be between 1-512)');
		}

		// Extract the actual image path (everything after type/size)
		const imagePath = pathParts.slice(2).join('/');

		// If no valid image path, return error
		if (!imagePath) {
			throw error(400, 'No image path specified');
		}

		// Log the transformation request
		console.log(`Transforming image: ${imagePath} to ${transformType} ${size}x${size}`);

		// Get the original image from S3
		const imageResult = await getImageFromS3(imagePath);

		if (!imageResult || !imageResult.Body) {
			throw error(404, 'Image not found');
		}

		// Get image buffer
		const imageBuffer = Buffer.from(await imageResult.Body.transformToByteArray());

		// Process the image based on transformation type
		let processedImage;
		let contentType = 'image/png'; // Default to PNG for favicon

		switch (transformType) {
			case 'square':
				// For SVG files, pass through as-is (browser will handle scaling)
				if (imagePath.toLowerCase().endsWith('.svg')) {
					processedImage = imageBuffer;
					contentType = 'image/svg+xml';
					console.log('SVG detected, passing through without transformation');
				} else {
					// For other images, use sharp to transform
					processedImage = await sharp(imageBuffer)
						.resize(size, size, {
							fit: 'cover', // Equivalent to "crop=center"
							position: 'centre' // Center the crop
						})
						.toBuffer();

					console.log(`Image transformed to ${size}x${size} square`);
				}
				break;

			default:
				throw error(400, `Unsupported transformation type: ${transformType}`);
		}

		// Set appropriate headers
		setHeaders({
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=86400', // Cache for 1 day
			ETag: `"${Buffer.from(imagePath).toString('base64')}_${transformType}_${size}"`
		});

		return new Response(processedImage);
	} catch (err) {
		console.error('Image transformation error:', err);
		throw error(500, 'Failed to transform image');
	}
};

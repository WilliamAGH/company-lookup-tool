import type { Handle } from '@sveltejs/kit';
import { initializeS3Client } from '$lib/utils/imagesS3.server';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
console.log('Loaded environment variables');
console.log(`OpenAI API Key set: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);

// Initialize the S3 client when the server starts
// Using an immediately invoked async function
(async () => {
	try {
		console.log('Initializing S3 client...');
		await initializeS3Client();
	} catch (error) {
		console.warn('Failed to initialize S3 client:', error);
	}
})();

const colorSchemeCookie = 'color-scheme';

/**
 * Handle color scheme preferences
 * Sets the color scheme in locals and injects it into the HTML
 */
const handleColorScheme: Handle = async ({ event, resolve }) => {
	// Get the color scheme from the cookie or default to 'system'
	event.locals.colorScheme = (event.cookies.get(colorSchemeCookie) as App.ColorScheme) || 'system';

	// Transform the HTML to inject the color scheme
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Find the opening html tag and add the data-color-scheme attribute
			return html.replace(
				/<html([^>]*)>/,
				`<html$1 data-color-scheme="${event.locals.colorScheme}">`
			);
		}
	});

	return response;
};

export const handle: Handle = handleColorScheme;

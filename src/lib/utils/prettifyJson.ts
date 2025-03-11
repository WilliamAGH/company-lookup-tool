/**
 * prettifyJson.ts
 * Utility for prettifying JSON with proper newlines
 *
 * This module provides functions to prettify JSON strings by properly handling
 * newline characters and ensuring proper indentation.
 *
 * IMPORTANT: When dealing with OpenAI API responses, use these functions to:
 * 1. Properly format JSON strings with indentation (prettifyJson)
 * 2. Convert escaped newlines (\n) to actual newlines (convertLiteralNewlines)
 * 3. Preserve newlines when stringifying objects (customStringify)
 *
 * Common usage pattern:
 * 1. First convert escaped newlines: convertLiteralNewlines(obj)
 * 2. Then stringify with preserved newlines: customStringify(convertedObj)
 *
 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - Example usage in API endpoint
 * @link data-tools/examples/prettifyOpenAIResponse.ts - Example usage with OpenAI responses
 */

/**
 * Prettifies a JSON string by properly handling newline characters
 *
 * This function takes a JSON string (which may be all on one line or poorly formatted)
 * and returns a properly indented version with 2-space indentation.
 *
 * IMPORTANT: This function does NOT handle escaped newlines (\n) in string values.
 * For that, use convertLiteralNewlines() first, then stringify the result.
 *
 * @param jsonString - The JSON string to prettify
 * @returns The prettified JSON string with proper indentation
 * @throws Returns the original string if parsing fails
 */
export function prettifyJson(jsonString: string): string {
	try {
		// Parse the JSON string to get a JavaScript object
		const parsedObj = JSON.parse(jsonString);

		// Re-stringify with indentation
		return JSON.stringify(parsedObj, null, 2);
	} catch (error) {
		// If parsing fails, return the original string
		console.error(
			`Error prettifying JSON: ${error instanceof Error ? error.message : String(error)}`
		);
		return jsonString;
	}
}

/**
 * Type guard to check if an object has a specific property
 */
function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown> {
	return typeof obj === 'object' && obj !== null && prop in obj;
}

/**
 * Converts literal \n sequences in strings to actual newlines
 *
 * This function recursively processes an object and converts all escaped newline
 * sequences (\n) in string values to actual newlines. It's especially useful for
 * OpenAI API responses where system prompts and function call arguments contain
 * escaped newlines.
 *
 * Special handling is provided for:
 * - OpenAI function_call.arguments (automatically prettifies the JSON string)
 * - OpenAI system_prompt.content and user_prompt.content (converts \n, \r, \t)
 * - All other string values (converts \n, \r, \t)
 *
 * @param obj - The object to process (can be any type)
 * @returns A new object with all literal \n sequences converted to actual newlines
 * @example
 * // Convert escaped newlines in an OpenAI response
 * const processedResponse = convertLiteralNewlines(openaiResponse);
 */
export function convertLiteralNewlines<T>(obj: T): T {
	if (obj === null || obj === undefined) return obj;

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map((item) => convertLiteralNewlines(item)) as unknown as T;
	}

	// Handle objects
	if (typeof obj === 'object') {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
			// Special handling for function_call.arguments (legacy format)
			if (key === 'arguments' && typeof value === 'string' && hasProperty(obj, 'name')) {
				// Pretty-print the JSON string
				result[key] = prettifyJson(value);
			}
			// Special handling for tool_calls.function.arguments (modern format)
			else if (key === 'function' && typeof value === 'object' && value !== null) {
				const functionObj = value as Record<string, unknown>;
				if (hasProperty(functionObj, 'arguments') && typeof functionObj.arguments === 'string') {
					// Create a copy of the function object with prettified arguments
					result[key] = {
						...functionObj,
						arguments: prettifyJson(functionObj.arguments as string)
					};
				} else {
					result[key] = convertLiteralNewlines(value);
				}
			}
			// Special handling for system_prompt.content and user_prompt.content
			else if (
				key === 'content' &&
				typeof value === 'string' &&
				hasProperty(obj, 'role') &&
				(obj.role === 'system' || obj.role === 'user')
			) {
				// Replace all occurrences of \n with actual newlines
				// This handles both escaped newlines and double-escaped newlines
				result[key] = value
					.replace(/\\n/g, '\n') // Replace \n with actual newlines
					.replace(/\\r/g, '\r') // Replace \r with actual carriage returns
					.replace(/\\t/g, '\t'); // Replace \t with actual tabs
			}
			// Convert literal \n to actual newlines in string values
			else if (typeof value === 'string') {
				result[key] = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
			} else {
				// Recursively process nested objects and arrays
				result[key] = convertLiteralNewlines(value);
			}
		}
		return result as unknown as T;
	}

	// Convert literal \n to actual newlines in string values
	if (typeof obj === 'string') {
		return obj.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t') as unknown as T;
	}

	// Return other primitive values unchanged
	return obj;
}

/**
 * Custom JSON stringify function that preserves newlines in strings
 *
 * Standard JSON.stringify() converts all newlines in strings to escaped sequences (\n).
 * This function preserves actual newlines in the output by using a placeholder technique:
 * 1. First stringify the object normally with indentation
 * 2. Replace all escaped newlines with a special placeholder
 * 3. Then replace the placeholders with actual newlines
 *
 * IMPORTANT: This function works best on objects that have already been processed
 * with convertLiteralNewlines() to ensure all \n sequences are converted to actual newlines.
 *
 * @param obj - The object to stringify
 * @returns A JSON string with preserved newlines for better readability
 * @example
 * // Stringify an object with preserved newlines
 * const jsonString = customStringify(processedObject);
 */
export function customStringify(obj: unknown): string {
	// First, convert all literal \n sequences to a special placeholder
	const placeholder = '__NEWLINE_PLACEHOLDER__';

	// Convert the object to a string with all \n sequences replaced with the placeholder
	let jsonString = JSON.stringify(obj, null, 2);

	// Replace all literal \n sequences with the placeholder
	jsonString = jsonString.replace(/\\n/g, placeholder);

	// Replace all placeholders with actual newlines
	jsonString = jsonString.replace(new RegExp(placeholder, 'g'), '\n');

	return jsonString;
}

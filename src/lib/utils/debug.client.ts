/**
 * CLIENT-SIDE DEBUG UTILITIES (.client.ts)
 *
 * Provides client-safe debugging utilities that won't import server-side code.
 * These utilities help with structured logging of complex objects and arrays
 * for improved development and troubleshooting experience.
 *
 * This file is explicitly marked .client.ts to maintain strict client/server separation.
 * Never import server-side code in this file.
 *
 * @link src/routes/api/debug/db/+server.ts - Server-side debug endpoint (DO NOT IMPORT IN CLIENT CODE)
 * @link src/lib/constants/placeholders.ts - Related client utilities
 */

/**
 * Deep logging utility that properly handles nested objects and arrays
 * for client-side debugging only. Does not access server resources.
 *
 * @param prefix A prefix to add to the log
 * @param data The data to log
 * @param depth Maximum depth to traverse (default: 5)
 * @returns The stringified data
 *
 * @example
 * // Basic usage
 * debugLog('Company data', companyObject);
 *
 * // With custom depth
 * debugLog('Complex nested object', complexObject, 3);
 */
export function debugLog(prefix: string, data: unknown, depth: number = 5): string {
	// Custom replacer function that properly handles depth for nested objects and arrays
	function customReplacer(currentDepth: number) {
		return function (key: string, value: unknown): unknown {
			// Base case: not an object or null
			if (typeof value !== 'object' || value === null) {
				return value;
			}

			// If we've reached max depth, return a descriptive string instead
			if (currentDepth <= 0) {
				return Array.isArray(value)
					? `[Array(${value.length})]`
					: `[Object(${Object.keys(value).length} keys)]`;
			}

			// For arrays, map each element with reduced depth
			if (Array.isArray(value)) {
				return value.map((item) => {
					if (typeof item === 'object' && item !== null) {
						// Process nested objects/arrays with reduced depth
						const nestedReplacer = customReplacer(currentDepth - 1);
						// Need to call it with a temporary object to work around JSON.stringify limitations
						return JSON.parse(JSON.stringify({ value: item }, nestedReplacer)).value;
					}
					return item;
				});
			}

			// For objects, process each property with reduced depth
			const newObj: Record<string, unknown> = {};
			// Need to cast value to an indexable type with string keys
			const valueAsRecord = value as Record<string, unknown>;
			for (const prop in value) {
				if (Object.prototype.hasOwnProperty.call(value, prop)) {
					const propValue = valueAsRecord[prop];
					if (typeof propValue === 'object' && propValue !== null) {
						// Process nested objects/arrays with reduced depth
						const nestedReplacer = customReplacer(currentDepth - 1);
						// Need to call it with a temporary object to work around JSON.stringify limitations
						newObj[prop] = JSON.parse(JSON.stringify({ value: propValue }, nestedReplacer)).value;
					} else {
						newObj[prop] = propValue;
					}
				}
			}
			return newObj;
		};
	}

	// Use JSON.stringify with our custom depth-aware replacer
	const replacer = customReplacer(depth);
	const stringified = JSON.stringify(data, replacer, 2);

	// Log to console with prefix - use the processed object for better console display
	console.log(`DEBUG: ${prefix}`, JSON.parse(stringified));

	return stringified;
}

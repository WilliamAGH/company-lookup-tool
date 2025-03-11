/**
 * Bun native SQL client for PostgreSQL
 *
 * This file provides direct access to Bun's SQL API. It must be run
 * with Bun directly. If accessed through other runtimes/bundlers, it
 * will throw a clear error.
 *
 * @link $lib/schemas/research/entity.schema.ts - Source of truth schema
 * @link https://bun.sh/docs/api/sql - Bun SQL documentation
 */

import { browser } from '$app/environment';

/**
 * Type for record objects returned from queries
 */
export type SqlRecord = Record<string, unknown>;

/**
 * Type for SQL identifiers (table/column names)
 */
interface SqlIdentifier {
	sql_identifier: string;
}

/**
 * Interface for SQL instance with template literal support
 */
interface SQLInstance {
	begin: <T>(callback: (tx: SQLInstance) => Promise<T>) => Promise<T>;
	(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]>;
	// Add identifier method for table/column names
	(identifier: string): SqlIdentifier;
}

/**
 * Error class for unavailable SQL operations
 */
class SQLMissingError extends Error {
	constructor() {
		super(
			'Bun SQL is not available. Make sure you are running with Bun instead of Node.js or ' +
				'a bundler. This project requires Bun runtime features.'
		);
	}
}

// Singleton instance to avoid multiple connections
let sqlInstance: SQLInstance | null = null;

/**
 * Get or initialize the SQL connection
 * Lazy-loads the connection at runtime to avoid issues during build
 *
 * @returns SQL instance for executing queries
 * @throws Error if not running in Bun environment
 */
export function getSql(): SQLInstance {
	// Only verify environment at runtime, not during import
	if (browser || typeof Bun === 'undefined') {
		throw new SQLMissingError();
	}

	// Create new instance if not exists
	if (!sqlInstance) {
		// Get actual Bun SQL connection
		const bunSql = new Bun.SQL(process.env.DATABASE_URL!);

		// Wrap with identifier support
		const wrappedSql = ((arg: TemplateStringsArray | string, ...values: unknown[]) => {
			// If arg is a string, return an identifier object
			if (typeof arg === 'string') {
				return { sql_identifier: arg };
			}

			// Process template literals with both regular values and identifiers
			const processedValues = values.map((value) => {
				// Handle identifier objects by escaping them properly
				if (value && typeof value === 'object' && 'sql_identifier' in value) {
					// Do basic identifier escaping
					return '"' + String(value.sql_identifier).replace(/"/g, '""') + '"';
				}
				return value;
			});

			// Call the actual SQL function with processed values
			return bunSql(arg as TemplateStringsArray, ...processedValues);
		}) as unknown as SQLInstance;

		// Add begin method for transactions
		wrappedSql.begin = async function <T>(callback: (tx: SQLInstance) => Promise<T>): Promise<T> {
			// Use the original begin method but wrap the transaction for compatibility
			return bunSql.begin(async (tx) => {
				// Create a proxy to wrap the transaction instance
				const wrappedTx = ((arg: TemplateStringsArray | string, ...values: unknown[]) => {
					// If arg is a string, return an identifier object
					if (typeof arg === 'string') {
						return { sql_identifier: arg };
					}

					// Process template literals with identifiers
					const processedValues = values.map((value) => {
						if (value && typeof value === 'object' && 'sql_identifier' in value) {
							return '"' + String(value.sql_identifier).replace(/"/g, '""') + '"';
						}
						return value;
					});

					// Call the transaction's tag template function
					return tx(arg as TemplateStringsArray, ...processedValues);
				}) as unknown as SQLInstance;

				// Make sure the transaction has a begin method that throws an error
				wrappedTx.begin = () => {
					throw new Error('Nested transactions are not supported');
				};

				// Call the original callback with our wrapped transaction
				return callback(wrappedTx);
			});
		};

		// Store the wrapped instance
		sqlInstance = wrappedSql;
	}

	return sqlInstance;
}

/**
 * Convenience export for direct access
 * Note: This still uses lazy initialization internally
 */
export const sql = new Proxy(
	// Base function that handles both template literals and identifiers
	((arg: TemplateStringsArray | string, ...values: unknown[]) => {
		const instance = getSql();

		// If first argument is a string, treat as identifier
		if (typeof arg === 'string') {
			return { sql_identifier: arg };
		}

		// Otherwise, it's a template literal query
		return instance(arg as TemplateStringsArray, ...values);
	}) as SQLInstance,
	{
		get(target, prop) {
			// Get the actual SQL instance on demand
			const instance = getSql();
			// @ts-expect-error - Dynamic property access
			return instance[prop];
		}
	}
);

/**
 * Entity-specific query helpers that use Bun's native SQL tagged templates
 * These functions retain type safety through generic parameters
 */
export const entityQueries = {
	/**
	 * Get entity by ID
	 *
	 * @param id UUID of the entity
	 * @returns Entity or null if not found
	 */
	getById: async <T = SqlRecord>(id: string): Promise<T | null> => {
		const instance = getSql();
		const results = await instance`
			SELECT * FROM research.res_entity 
			WHERE id = ${id}
		`;
		return (results[0] as T) || null;
	},

	/**
	 * Get entity by slug
	 *
	 * @param slug URL slug of the entity
	 * @returns Entity or null if not found
	 */
	getBySlug: async <T = SqlRecord>(slug: string): Promise<T | null> => {
		const instance = getSql();
		const results = await instance`
			SELECT * FROM research.res_entity 
			WHERE slug = ${slug}
		`;
		return (results[0] as T) || null;
	},

	/**
	 * List entities with pagination
	 *
	 * @param limit Maximum number of results
	 * @param offset Pagination offset
	 * @returns Array of entities
	 */
	list: async <T = SqlRecord>(limit = 20, offset = 0): Promise<T[]> => {
		const instance = getSql();
		const results = await instance`
			SELECT * FROM research.res_entity
			ORDER BY name_brand ASC
			LIMIT ${limit} OFFSET ${offset}
		`;
		return results as T[];
	},

	/**
	 * Run a transaction for entity operations
	 *
	 * @param callback Function containing transaction operations
	 * @returns Result from the transaction callback
	 */
	transaction: async <T>(callback: (tx: SQLInstance) => Promise<T>): Promise<T> => {
		const instance = getSql();
		return instance.begin(async (tx: SQLInstance) => {
			return await callback(tx);
		});
	},

	testConnection: async () => {
		const instance = getSql();
		const [result] = await instance`
			SELECT 
				current_setting('server_version') as "postgresVersion"
		`;
		return { postgresVersion: (result as { postgresVersion: string }).postgresVersion };
	}
};

/**
 * Configuration utilities
 *
 * Provides helper functions for loading and parsing configuration files
 * using Bun's JSONC support, which allows comments and trailing commas.
 *
 * @example
 * import { loadConfig } from '$lib/utils/config';
 * const packageJson = await loadConfig('package.json');
 */

/**
 * Load and parse a JSON configuration file with support for comments and trailing commas
 *
 * @param path Path to the JSON configuration file
 * @returns Parsed configuration object
 */
export async function loadConfig<T = Record<string, unknown>>(path: string): Promise<T> {
	try {
		// Using dynamic import with Bun's JSONC support
		const config = await import(path, { with: { type: 'jsonc' } });
		return config.default as T;
	} catch (error) {
		console.error(`Error loading config file ${path}:`, error);
		throw new Error(`Failed to load configuration from ${path}`);
	}
}

/**
 * Load project's package.json with type safety
 *
 * @returns Package.json contents
 */
export async function loadPackageJson(): Promise<{
	name: string;
	version: string;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	[key: string]: unknown;
}> {
	return loadConfig('./package.json');
}

/**
 * Load TypeScript configuration
 *
 * @returns tsconfig.json contents
 */
export async function loadTsConfig(): Promise<{
	compilerOptions?: Record<string, unknown>;
	include?: string[];
	exclude?: string[];
	[key: string]: unknown;
}> {
	return loadConfig('./tsconfig.json');
}

/**
 * Load VS Code settings
 *
 * @returns VS Code settings.json contents
 */
export async function loadVsCodeSettings(): Promise<Record<string, unknown>> {
	return loadConfig('./.vscode/settings.json');
}

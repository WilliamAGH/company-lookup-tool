// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		type ColorScheme = 'light' | 'dark' | 'system';

		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			colorScheme: ColorScheme;
		}
	}

	/**
	 * Global Bun namespace for direct access
	 * Used for accessing Bun-specific APIs without import
	 */
	interface Window {
		Bun: typeof import('bun');
	}

	/**
	 * SQL instance type for Bun's SQL client
	 * Used for type-safe SQL operations through globalThis.Bun
	 */
	interface SQLInstance {
		begin: <T>(callback: (tx: SQLInstance) => Promise<T>) => Promise<T>;
		(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]>;
	}
}

export {};

/**
 * Type declarations for SvelteKit environment modules
 *
 * This file provides type declarations for the $env/dynamic/private and $env/dynamic/public
 * modules used by SvelteKit. These declarations allow TypeScript to understand the imports
 * when running direct TypeScript checks outside of the SvelteKit context.
 */

declare module '$env/dynamic/private' {
	export const env: Record<string, string>;
}

declare module '$env/dynamic/public' {
	export const env: Record<string, string>;
}

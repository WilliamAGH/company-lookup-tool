// @ts-expect-error mdsvex type definitions are not complete
import { mdsvex } from 'mdsvex';
import bunAdapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Use Bun adapter for all environments in Docker
const adapter = bunAdapter();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// Use Bun adapter
		adapter: adapter,

		// Environment variables configuration
		env: {
			publicPrefix: 'PUBLIC_'
		},

		// Path aliases configuration
		// IMPORTANT: Always define path aliases here using kit.alias, NOT in tsconfig.json
		// SvelteKit generates its own tsconfig.json that can be interfered with by manual path configurations
		// See: https://svelte.dev/docs/kit/configuration#alias
		alias: {
			$lib: './src/lib',
			'$lib/*': './src/lib/*',
			'$data-tools': './data-tools',
			'$data-tools/*': './data-tools/*'
		},

		// TypeScript integration
		// tsconfig.json is the ONLY source of truth for TypeScript configuration
		// No manual overrides are defined here to prevent duplication
		typescript: {
			// Intentionally empty - uses tsconfig.json exclusively
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;

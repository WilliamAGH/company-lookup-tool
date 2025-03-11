import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],

	// Add logging to help diagnose issues
	logLevel: 'info',
	// Increase timeout for slow operations
	server: {
		hmr: {
			timeout: 60000
		},
		// Allow serving files from data-tools directory
		fs: {
			allow: [
				// Add the data-tools directory to the allow list
				resolve('./data-tools')
			]
		}
	},

	// Fix dependency optimization issues
	optimizeDeps: {
		exclude: ['clsx']
	},

	// Add path alias for data-tools
	resolve: {
		alias: {
			'$data-tools': resolve('./data-tools')
		}
	},

	// Configure external dependencies for build
	build: {
		rollupOptions: {
			external: ['typescript-json-schema']
		}
	},

	// Skip processing Bun-specific modules during build
	ssr: {
		noExternal: [],
		external: [
			// Skip Bun SQL modules during SSR build to prevent errors
			'**/sql.server.ts',
			'**/database/sql.server.ts'
		]
	}
});

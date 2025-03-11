/**
 * CENTRALIZED ESLINT CONFIGURATION
 *
 * This is the single source of truth for ESLint configuration.
 * - File patterns come from tsconfig.json (see "include"/"exclude" there)
 * - VS Code settings should not override these rules
 * - This configuration inherits gitignore patterns automatically
 */
import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default [
	// Explicitly ignore markdown files and JSON files
	{
		ignores: ['**/*.md', '**/*.mdx', '**/*.svx', '**/*.json', '**/*.html']
	},
	// Rest of the configuration
	...ts.config(
		includeIgnoreFile(gitignorePath),
		js.configs.recommended,
		...ts.configs.recommended,
		...svelte.configs['flat/recommended'],
		prettier,
		...svelte.configs['flat/prettier'],
		{
			languageOptions: {
				globals: {
					...globals.browser,
					...globals.node
				}
			}
		},
		// Special rules for openaiApi.ts file
		{
			files: ['**/openaiApi.ts'],
			rules: {
				'@typescript-eslint/naming-convention': [
					'error',
					// Allow max_tokens and other OpenAI API parameters
					{
						selector: 'variable',
						format: null,
						filter: {
							regex: '^(max_tokens|temperature|top_p|frequency_penalty|presence_penalty)$',
							match: true
						}
					},
					// Allow properties with hyphens (OpenAI model names, HTTP headers)
					{
						selector: 'property',
						format: null,
						filter: {
							regex: '.*-.*',
							match: true
						}
					},
					// Variables and functions must use camelCase
					{
						selector: ['variable', 'function'],
						format: ['camelCase', 'snake_case'], // Allow both formats for this file
						leadingUnderscore: 'allow'
					},
					// Classes, interfaces, type aliases, and enums should use PascalCase
					{
						selector: ['class', 'interface', 'typeAlias', 'enum'],
						format: ['PascalCase']
					},
					// Type parameters should use PascalCase
					{
						selector: 'typeParameter',
						format: ['PascalCase']
					},
					// Enum members should use PascalCase
					{
						selector: 'enumMember',
						format: ['PascalCase']
					},
					// Allow snake_case for properties
					{
						selector: 'property',
						format: ['camelCase', 'snake_case'],
						leadingUnderscore: 'allow'
					}
				]
			}
		},
		// Naming conventions from development.md
		{
			files: ['**/*.ts', '**/*.js', '**/*.svelte'],
			ignores: [
				'**/eslint.config.js',
				'**/svelte.config.js',
				'**/vite.config.ts',
				'**/postcss.config.js',
				'**/tailwind.config.js',
				'**/openaiApi.ts' // Exclude openaiApi.ts from general rules
			],
			rules: {
				'@typescript-eslint/naming-convention': [
					'error',
					// Variables and functions must use camelCase
					{
						selector: ['variable', 'function'],
						format: ['camelCase'],
						leadingUnderscore: 'allow',
						// Exception for SvelteKit HTTP methods (GET, POST, etc.)
						filter: {
							regex: '^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$',
							match: false
						}
					},
					// Special case for HTTP methods in API routes
					{
						selector: ['function'],
						format: ['UPPER_CASE'],
						filter: {
							regex: '^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$',
							match: true
						}
					},
					// Disallow ALL_CAPS for variables/constants
					{
						selector: ['variable'],
						format: ['camelCase', 'PascalCase'],
						leadingUnderscore: 'allow',
						filter: {
							regex: '^[A-Z][A-Z0-9_]+$',
							match: false
						}
					},
					// Classes, interfaces, type aliases, and enums should use PascalCase
					{
						selector: ['class', 'interface', 'typeAlias', 'enum'],
						format: ['PascalCase']
					},
					// Type parameters should use PascalCase
					{
						selector: 'typeParameter',
						format: ['PascalCase']
					},
					// Enum members should use PascalCase
					{
						selector: 'enumMember',
						format: ['PascalCase']
					},
					// Allow HTTP headers with hyphens (any case pattern)
					{
						selector: 'property',
						format: null, // Allow any format
						filter: {
							// Match common HTTP headers and custom headers with hyphens
							regex:
								'^([Cc]ontent-[Tt]ype|[Cc]ache-[Cc]ontrol|[Aa]uthorization|[Xx]-[A-Za-z0-9-]+|[A-Za-z][a-z]*(-[A-Za-z][a-z]*)+)$',
							match: true
						}
					},
					// Allow snake_case only for properties that might match database columns
					{
						selector: 'property',
						format: ['camelCase', 'snake_case'],
						leadingUnderscore: 'allow'
					}
				]
			}
		},
		// Schema Architecture Rules
		{
			files: ['**/*.svelte', 'src/routes/**/*.ts', '!src/routes/**/*.server.ts'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								group: ['$lib/schemas/**/*'],
								importNames: ['*Schema', '*Enum'],
								message:
									'UI CODE TREE-SHAKING VIOLATION: Import types only in UI files, not schema objects.'
							}
						]
					}
				]
			}
		},
		{
			files: ['src/lib/schemas/**/*.schema.ts'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{ group: ['$app/*'], message: 'HYDRATION RISK: No SvelteKit imports in schemas.' },
							{ group: ['$lib/server/*'], message: 'HYDRATION RISK: No server code in schemas.' },
							{ group: ['$lib/client/*'], message: 'HYDRATION RISK: No client code in schemas.' }
						]
					}
				]
			}
		},
		{
			files: ['**/*.svelte'],
			languageOptions: {
				parserOptions: {
					parser: ts.parser
				}
			},
			rules: {
				// Disable the export_let_unused warning
				'svelte/no-unused-svelte-ignore': 'off',
				'svelte/valid-compile': ['error', { ignoreWarnings: true }]
			}
		},
		// Override for declaration files (.d.ts) - allow 'any' type
		{
			files: ['**/*.d.ts'],
			rules: {
				'@typescript-eslint/no-explicit-any': 'warn',
				'@typescript-eslint/explicit-module-boundary-types': 'warn',
				'@typescript-estlint/no-unecessary-type-assertion': 'warn'
			}
		},
		// Temporarily downgrade each-key requirement to warning
		{
			files: ['**/*.svelte'],
			rules: {
				'svelte/require-each-key': 'warn'
			}
		}
	)
];

/**
 * schemaToJson.ts
 *
 * Centralized schema definition translation for OpenAI function calls.
 * This module serves as the single source of truth for JSON schema conversions,
 * ensuring consistent structure across API calls, validation, and UI rendering.
 *
 * All schema definitions in this file directly import and use enum values from
 * the Zod schema files, eliminating duplication and ensuring that changes
 * to the schema definitions are automatically reflected in API calls.
 *
 * @link src/lib/schemas/research/index.ts - Central schema index for all type definitions
 * @link data-tools/openai.ts - Schema consumption for OpenAI API calls
 * @link src/routes/newcompanylookup/+page.svelte - UI component using transformed data
 *
 * IMPORTANT: The schema structure MUST follow the entity-based approach defined in
 * the Zod schemas. Top-level fields should be inside the entity.details array,
 * not as separate objects. Product and competitor data should be properly nested.
 */

import * as TJS from 'typescript-json-schema';
import { resolve } from 'path';
import type { ChatCompletionCreateParams } from 'openai';

// Import types from central schema index
// Note: AnalysisData imported for documentation purposes, showing what structure we're generating schemas for
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AnalysisData } from '../../src/lib/schemas/research';

// Import enum values directly from Zod schema files
// These are needed as runtime values, not just types
import {
	typeResearchDetailEnum,
	dataConfidenceEnum,
	sourceTypeEnum
} from '../../src/lib/schemas/research/detail_enums.schema';
import { statusOperatingEnum } from '../../src/lib/schemas/research/entity.schema';
import { urlTypeEnum } from '../../src/lib/schemas/research/url.schema';
import { identifierTypeEnum } from '../../src/lib/schemas/research/unique_id.schema';

/**
 * Type for standard JSON schema definition
 * Used as the return type for schema generation functions
 */
type JsonSchema = Record<string, unknown>;

// Type definition for TJS.Definition - Not directly used but kept for documentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SchemaDefinition = TJS.Definition & Record<string, unknown>;

/**
 * OpenAI function definition type
 * This is used to create the function definition for OpenAI API calls
 * Reuses the existing OpenAI SDK type definition to avoid duplication
 */
type FunctionDefinition = NonNullable<ChatCompletionCreateParams['functions']>[number];

// Cache the generated schemas for performance
const schemaCache = new Map<string, JsonSchema>();

/**
 * Generate a JSON schema from a TypeScript interface
 *
 * Uses typescript-json-schema to generate a schema based on the TypeScript interface name.
 * Caches results for performance and uses TypeScript reflection to ensure accuracy.
 *
 * @param {string} interfaceName - The name of the TypeScript interface to convert to JSON schema
 * @returns {JsonSchema} The generated JSON schema
 */
export function generateSchema(interfaceName: string): JsonSchema {
	// Check cache first
	if (schemaCache.has(interfaceName)) {
		return schemaCache.get(interfaceName)!;
	}

	// Generate schema on cache miss
	const program = TJS.getProgramFromFiles([resolve(__dirname, './types.ts')]);
	const schema = TJS.generateSchema(program, interfaceName, {
		required: true,
		noExtraProps: true
	}) as JsonSchema;

	if (!schema) {
		throw new Error(`Could not generate schema for ${interfaceName}`);
	}

	// Cache result
	schemaCache.set(interfaceName, schema as JsonSchema);
	return schema as JsonSchema;
}

/**
 * Creates a re-usable entity detail schema object
 * This centralizes the definition to avoid duplication in different function schemas
 *
 * @returns Standard entity detail schema object
 * @private
 */
function createEntityDetailSchema() {
	return {
		type: 'object',
		properties: {
			type_research_detail: {
				type: 'string',
				description: 'Type of research detail',
				enum: typeResearchDetailEnum.options
			},
			data_confidence: {
				type: 'string',
				enum: dataConfidenceEnum.options,
				description: 'Confidence level in this detail'
			},
			source_type: {
				type: 'string',
				enum: sourceTypeEnum.options,
				description: 'Source type for this detail'
			},
			as_of_date: {
				type: 'string',
				format: 'date-time',
				description:
					'Date this detail was recorded/reported in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)'
			},
			discrete_value: {
				type: 'number',
				description: 'Numeric value for this detail (if applicable)'
			},
			text_value: {
				type: 'string',
				description: 'Text value for this detail (if applicable)'
			}
		},
		required: ['type_research_detail', 'data_confidence', 'source_type']
	};
}

/**
 * Creates the primary OpenAI function definition for company analysis
 *
 * This function defines the JSON schema that OpenAI will use to structure
 * its responses for competitive analysis. The schema:
 * 1. Directly uses enum values from the Zod schemas
 * 2. Follows the entity-based nesting pattern (entity > products > competitors)
 * 3. Includes all required fields and proper validation rules
 *
 * The returned schema is consumed by:
 * - data-tools/openai.ts - For function calling with the OpenAI API
 * - src/routes/api/rest/v1/company/competitive-analysis/+server.ts - For validation
 * - src/routes/newcompanylookup/+page.svelte - For data transformation
 *
 * @returns {FunctionDefinition} The OpenAI function definition with parameters
 */
export function createSimplifiedAnalysisFunction(): FunctionDefinition {
	// Re-use the entity detail schema definition
	const entityDetailSchema = createEntityDetailSchema();

	// Return the function schema that matches our entity-based data structure
	return {
		name: 'analyze_company',
		description:
			'Generate a structured financial and competitive analysis of a company following entity-detail schema',
		parameters: {
			type: 'object',
			properties: {
				entity: {
					type: 'object',
					description: 'Company entity information using the correct schema structure',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
							description: 'Entity ID (use null for new entities)',
							nullable: true
						},
						name_brand: {
							type: 'string',
							description: 'The common trade name of the company'
						},
						name_legal: {
							type: 'string',
							description: 'The formal legal name of the company (only provide if confident)'
						},
						date_year_established: {
							type: 'integer',
							description: 'Year when the company was established (e.g., 1999)'
						},
						status_operating: {
							type: 'string',
							enum: statusOperatingEnum.options,
							description: 'Current operating status of the company'
						},

						details: {
							type: 'array',
							description: 'Key-value details about the company following our entity detail schema',
							items: entityDetailSchema
						},

						urls: {
							type: 'array',
							description: 'URLs associated with the company',
							items: {
								type: 'object',
								properties: {
									url_type: {
										type: 'string',
										description: 'Type of URL',
										enum: urlTypeEnum.options
									},
									url: {
										type: 'string',
										description: 'The actual URL'
									},
									is_primary: {
										type: 'boolean',
										description: 'Whether this is the primary URL of this type'
									}
								},
								required: ['url_type', 'url']
							}
						},

						identifiers: {
							type: 'array',
							description: 'Unique identifiers for this company',
							items: {
								type: 'object',
								properties: {
									id_type: {
										type: 'string',
										description: 'Type of identifier',
										enum: identifierTypeEnum.options
									},
									unique_id: {
										type: 'string',
										description: 'The identifier value'
									}
								},
								required: ['id_type', 'unique_id']
							}
						},

						products: {
							type: 'array',
							description: 'Products offered by this company',
							items: {
								type: 'object',
								properties: {
									id: {
										type: 'string',
										format: 'uuid',
										description: 'Product ID (use null for new entities)',
										nullable: true
									},
									name_brand: {
										type: 'string',
										description: 'Product name'
									},
									date_year_established: {
										type: 'integer',
										description: 'Year when the product was launched'
									},
									details: {
										type: 'array',
										description: 'Details about this product following our entity detail schema',
										items: entityDetailSchema
									},
									competitors: {
										type: 'array',
										description: 'Competing products and companies',
										items: {
											type: 'object',
											properties: {
												id: {
													type: 'string',
													format: 'uuid',
													description: 'Competitor ID (use null for new entities)',
													nullable: true
												},
												name_brand: {
													type: 'string',
													description: 'Competitor name'
												},
												details: {
													type: 'array',
													description: 'Details about this competitor',
													items: entityDetailSchema
												}
											},
											required: ['name_brand']
										}
									}
								},
								required: ['name_brand']
							}
						}
					},
					required: ['name_brand', 'products']
				},
				_meta: {
					type: 'object',
					description: 'Optional metadata about the analysis',
					properties: {
						// No requirements for metadata since it's managed by the API
					}
				}
			},
			required: ['entity']
		}
	};
}

/**
 * Creates a function definition for retrieving basic company information
 * This is a simplified schema used in the first step of the multi-step analysis
 *
 * @returns {FunctionDefinition} The OpenAI function definition with parameters
 */
export function createBasicCompanyInfoFunction(): FunctionDefinition {
	return {
		name: 'get_basic_company_info',
		description: 'Return basic information about a company, its products, and competitors',
		parameters: {
			type: 'object',
			properties: {
				company_name: {
					type: 'string',
					description: 'The name of the company'
				},
				main_products: {
					type: 'array',
					description: 'List of main products or services offered by the company',
					items: {
						type: 'string'
					}
				},
				main_competitors: {
					type: 'array',
					description: 'List of primary competitors to this company',
					items: {
						type: 'string'
					}
				}
			},
			required: ['company_name', 'main_products', 'main_competitors']
		}
	};
}

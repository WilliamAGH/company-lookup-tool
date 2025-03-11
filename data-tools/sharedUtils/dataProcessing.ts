/**
 * dataProcessing.ts - CENTRAL SOURCE OF TRUTH
 *
 * Central utilities for data processing, validation, and transformation between
 * database schemas and UI formats.
 *
 * @link src/lib/server/db/research/schema/index.ts - Schema definitions
 * @link src/routes/companies/[slug]/types.ts - UI type definitions
 * @link data-tools/openai.ts - API processing
 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - API endpoint
 */

import { z } from 'zod';

// Import all types from the Zod schema
import {
	// Import type definitions
	type AnalysisData,
	type EstimatedRange,
	type EntityDetail,

	// Import enum types
	type DataConfidence,
	type SourceType,
	type TypeResearchDetail,
	type MetricType,

	// Import enum values and schemas
	dataConfidenceEnum,
	typeResearchDetailEnum,
	sourceTypeEnum,
	productEntitySchema,
	entityDetailSchema,
	financialSourceTypes,
	marketShareSourceTypes
} from '../../src/lib/schemas/research';

// Import UI-specific types
import type {
	EnhancedCompanyData,
	ProductLine,
	Competitor
} from '../../src/routes/companies/[slug]/types';

// Type definitions
export type BaseMetadata = {
	entity_id?: string;
	source_type?: SourceType;
	data_confidence?: DataConfidence;
	as_of_date?: string;
	creator?: string;
};

export type ProductDetail = NonNullable<
	NonNullable<AnalysisData['entity']['products']>[number]['details']
>[number];

// Create a recursive type definition for product entities with competitors
type RecursiveProductType = z.infer<typeof productEntitySchema> & {
	competitors?: RecursiveProductType[];
};

// Define recursive product entity schema using Zod lazy without 'any'
const recursiveProductEntitySchema: z.ZodType<RecursiveProductType> = z.lazy(() =>
	productEntitySchema.extend({
		competitors: z.array(recursiveProductEntitySchema).optional()
	})
);

export type RecursiveProductEntity = z.infer<typeof recursiveProductEntitySchema>;

// Validation rules and multipliers - using camelCase per naming convention
const rangeMultipliers = {
	high: { revenue: 0.1, employees: 0.1, valuation: 0.15 },
	medium: { revenue: 0.2, employees: 0.2, valuation: 0.25 },
	low: { revenue: 0.3, employees: 0.3, valuation: 0.4 }
};

/**
 * Utility functions for data transformation and validation
 */
const utils = {
	/**
	 * Maps a string to a valid enum value with fallback using Zod enum validation
	 */
	mapToEnum: <T extends z.ZodEnum<[string, ...string[]]>>(
		value: string,
		zodEnum: T,
		defaultValue: z.infer<T>
	): z.infer<T> => {
		try {
			return zodEnum.parse(value);
		} catch {
			return defaultValue;
		}
	},

	/**
	 * Verifies an array exists and has elements
	 */
	isValidArray: (array: unknown): boolean => Array.isArray(array) && array.length > 0,

	/**
	 * Safely extracts a property from a nested object
	 */
	safeExtract: <T>(obj: Record<string, unknown> | undefined, path: string, defaultValue: T): T => {
		try {
			// Split the path by dots and reduce to find the nested property
			const value = path
				.split('.')
				.reduce(
					(o: Record<string, unknown> | undefined, p: string) =>
						o && typeof o === 'object' && p in o ? (o[p] as Record<string, unknown>) : undefined,
					obj
				);
			return value !== undefined ? (value as unknown as T) : defaultValue;
		} catch {
			return defaultValue;
		}
	}
};

/**
 * Maps field values to their enum equivalents using Zod enums
 */
const mappers = {
	confidence: (level: string): DataConfidence =>
		utils.mapToEnum(level, dataConfidenceEnum, 'medium'),

	sourceType: (source: string): SourceType =>
		utils.mapToEnum(source, sourceTypeEnum, 'analyst_estimate'),

	detailType: (type: string): TypeResearchDetail =>
		utils.mapToEnum(type, typeResearchDetailEnum, 'market_share_estimate')
};

/**
 * Confidence level utilities
 */
export const confidence = {
	isHigh: (level: DataConfidence): boolean => level === 'high',
	isMediumOrHigher: (level: DataConfidence): boolean => ['medium', 'high'].includes(level),

	/**
	 * Calculates a value range based on confidence level and metric type
	 */
	calculateRange: (
		confidence: DataConfidence,
		metricType: MetricType,
		value: number
	): EstimatedRange => {
		// Determine which multiplier to use based on metric type
		const metricCategory =
			metricType.includes('revenue') || metricType.includes('market_size')
				? 'revenue'
				: metricType.includes('employee')
					? 'employees'
					: 'valuation';

		// Use safe confidence level and get the appropriate multiplier
		const safeConfidence = ['high', 'medium', 'low'].includes(confidence)
			? (confidence as 'high' | 'medium' | 'low')
			: 'medium';

		const multiplier = rangeMultipliers[safeConfidence][metricCategory];
		const variation = value * multiplier;

		return {
			min: Math.max(0, Math.round(value - variation)),
			max: Math.round(value + variation)
		};
	}
};

/**
 * Data validation utilities
 */
export const validate = {
	/**
	 * Validates basic structure of analysis data using Zod parsing
	 * Returns { isValid: boolean, errors?: string[] }
	 */
	basicStructure: (response: unknown): { isValid: boolean; errors?: string[] } => {
		// Create a minimal schema just for structure validation
		const basicStructureSchema = z.object({
			entity: z.object({
				name_brand: z.string().optional(),
				details: z.array(z.unknown()).optional(),
				products: z.array(z.unknown()).optional()
			})
		});

		try {
			basicStructureSchema.parse(response);
			return { isValid: true };
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					isValid: false,
					errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
				};
			}
			return { isValid: false, errors: ['Invalid data structure'] };
		}
	},

	/**
	 * Validates entire analysis data structure using the full AnalysisData schema
	 * Returns { isValid: boolean, errors?: string[] }
	 */
	analysisData: (data: unknown): { isValid: boolean; errors?: string[] } => {
		// We'll create a Zod schema based on the AnalysisData type
		const analysisDataSchema = z.object({
			entity: z.object({
				id: z.string().nullable(),
				name_brand: z.string(),
				details: z.array(entityDetailSchema).optional(),
				products: z.array(recursiveProductEntitySchema).optional()
			}),
			_meta: z
				.object({
					cost: z
						.object({
							totalTokens: z.number(),
							costUSD: z.number()
						})
						.optional(),
					validation: z.string().optional()
				})
				.optional()
		});

		try {
			analysisDataSchema.parse(data);
			return { isValid: true };
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					isValid: false,
					errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
				};
			}
			return { isValid: false, errors: ['Invalid analysis data structure'] };
		}
	}

	// Other validation functions...
};

/**
 * Repairs analysis data structure using Zod schemas to ensure proper structure
 * This function is used to fix common issues with API responses
 *
 * @param {unknown} data - Potentially incomplete/invalid analysis data
 * @param {boolean} debug - Enable debug logging
 * @returns {AnalysisData} - Repaired analysis data with valid structure
 */
export function repairAnalysisData(data: unknown, debug = false): AnalysisData {
	// Default structure with all required properties
	const defaultData: AnalysisData = {
		entity: {
			id: null,
			name_brand: 'Unknown Company',
			details: [],
			products: [] // Include products array
		},
		_meta: {
			cost: {
				totalTokens: 0,
				costUSD: 0
			}
		}
	};

	if (!data || typeof data !== 'object') {
		console.error('Invalid data provided to repairAnalysisData, creating minimal structure');
		return defaultData;
	}

	// Cast to record for easier access
	const rawData = data as Record<string, unknown>;

	try {
		// CASE 1: Data already has entity structure with snake_case
		if (rawData.entity && typeof rawData.entity === 'object') {
			const entityData = rawData.entity as Record<string, unknown>;
			// Create new data with all required properties
			const newData: AnalysisData = {
				entity: {
					id: null,
					name_brand: 'Unknown Company',
					details: [] as EntityDetail[],
					products: [] // Initialize empty products array
				},
				_meta: {
					cost: {
						totalTokens: 0,
						costUSD: 0
					}
				}
			};

			// Copy basic entity properties using snake_case
			if (typeof entityData.name_brand === 'string') {
				newData.entity.name_brand = entityData.name_brand;
			} else if (typeof entityData.nameBrand === 'string') {
				// Legacy camelCase fallback
				newData.entity.name_brand = entityData.nameBrand;
			}

			// Add details if they exist
			if (Array.isArray(entityData.details)) {
				newData.entity.details = entityData.details.map((detail) => {
					const d = detail as Record<string, unknown>;
					// Convert camelCase to snake_case if needed
					return {
						type_research_detail:
							d.type_research_detail || d.typeResearchDetail || 'market_share_estimate',
						data_confidence: d.data_confidence || d.dataConfidence || 'medium',
						source_type: d.source_type || d.sourceType || 'analyst_estimate',
						as_of_date: d.as_of_date || d.asOfDate || new Date().toISOString().split('T')[0],
						discrete_value:
							typeof d.discrete_value === 'number'
								? d.discrete_value
								: typeof d.discreteValue === 'number'
									? d.discreteValue
									: undefined,
						text_value:
							typeof d.text_value === 'string'
								? d.text_value
								: typeof d.textValue === 'string'
									? d.textValue
									: undefined
					} as EntityDetail;
				});
			}

			// Add products with proper snake_case
			if (Array.isArray(entityData.products)) {
				newData.entity.products = entityData.products.map((product) => {
					if (!product || typeof product !== 'object') {
						return { id: null, name_brand: 'Unknown Product', details: [] };
					}

					const productData = product as Record<string, unknown>;
					return {
						id: null,
						name_brand:
							typeof productData.name_brand === 'string'
								? productData.name_brand
								: typeof productData.nameBrand === 'string'
									? productData.nameBrand
									: 'Unknown Product',
						details: Array.isArray(productData.details)
							? productData.details.map((d) => ({
									type_research_detail: getDetailProperty(
										d,
										'type_research_detail',
										'typeResearchDetail',
										'market_share_estimate'
									),
									data_confidence: getDetailProperty(
										d,
										'data_confidence',
										'dataConfidence',
										'medium'
									),
									source_type: getDetailProperty(
										d,
										'source_type',
										'sourceType',
										'analyst_estimate'
									),
									as_of_date: getDetailProperty(
										d,
										'as_of_date',
										'asOfDate',
										new Date().toISOString().split('T')[0]
									),
									discrete_value:
										typeof d.discrete_value === 'number'
											? d.discrete_value
											: typeof d.discreteValue === 'number'
												? d.discreteValue
												: undefined,
									text_value:
										typeof d.text_value === 'string'
											? d.text_value
											: typeof d.textValue === 'string'
												? d.textValue
												: undefined
								}))
							: [],
						competitors: Array.isArray(productData.competitors)
							? productData.competitors.map((comp) => {
									if (!comp || typeof comp !== 'object') {
										return { id: null, name_brand: 'Unknown Competitor', details: [] };
									}

									const compData = comp as Record<string, unknown>;
									return {
										id: null,
										name_brand:
											typeof compData.name_brand === 'string'
												? compData.name_brand
												: typeof compData.nameBrand === 'string'
													? compData.nameBrand
													: 'Unknown Competitor',
										details: Array.isArray(compData.details)
											? compData.details.map((d) => ({
													type_research_detail: getDetailProperty(
														d,
														'type_research_detail',
														'typeResearchDetail',
														'market_share_estimate'
													),
													data_confidence: getDetailProperty(
														d,
														'data_confidence',
														'dataConfidence',
														'medium'
													),
													source_type: getDetailProperty(
														d,
														'source_type',
														'sourceType',
														'analyst_estimate'
													),
													as_of_date: getDetailProperty(
														d,
														'as_of_date',
														'asOfDate',
														new Date().toISOString().split('T')[0]
													),
													discrete_value:
														typeof d.discrete_value === 'number'
															? d.discrete_value
															: typeof d.discreteValue === 'number'
																? d.discreteValue
																: undefined,
													text_value:
														typeof d.text_value === 'string'
															? d.text_value
															: typeof d.textValue === 'string'
																? d.textValue
																: undefined
												}))
											: []
									};
								})
							: []
					};
				});
			}

			// Copy metadata
			if (rawData._meta && typeof rawData._meta === 'object') {
				newData._meta = rawData._meta as NonNullable<AnalysisData['_meta']>;
			}

			return newData as AnalysisData;
		}
		// CASE 2: Legacy format with company at top level
		else if (
			(rawData.company || rawData.company_name || rawData.name) &&
			Array.isArray(rawData.products)
		) {
			// Create proper structure with all required properties
			const newData: AnalysisData = {
				entity: {
					id: null,
					name_brand: 'Unknown Company',
					details: [],
					products: [] // Initialize empty products array
				},
				_meta: {
					cost: {
						totalTokens: 0,
						costUSD: 0
					}
				}
			};

			// Get company name from one of several possible locations
			const companyName =
				(typeof rawData.company === 'object' && rawData.company
					? (rawData.company as Record<string, unknown>).name ||
						(rawData.company as Record<string, unknown>).company_name ||
						(rawData.company as Record<string, unknown>).trade_name
					: null) ||
				rawData.company_name ||
				rawData.name ||
				rawData.trade_name ||
				'Unknown Company';

			newData.entity.name_brand = typeof companyName === 'string' ? companyName : 'Unknown Company';

			// Handle products in snake_case
			newData.entity.products = rawData.products.map((product: unknown, index: number) => {
				if (!product || typeof product !== 'object') {
					return { id: null, name_brand: `Product ${index + 1}`, details: [] };
				}

				const productData = product as Record<string, unknown>;

				// Extract product name from various possible fields
				const productName =
					productData.name ||
					productData.product_name ||
					productData.name_brand ||
					productData.nameBrand ||
					`Product ${index + 1}`;

				return {
					id: null,
					name_brand: typeof productName === 'string' ? productName : `Product ${index + 1}`,
					details: [],
					competitors: Array.isArray(productData.competitors)
						? productData.competitors.map((comp: unknown, compIndex: number) => {
								if (!comp || typeof comp !== 'object') {
									return { id: null, name_brand: `Competitor ${compIndex + 1}`, details: [] };
								}

								const compData = comp as Record<string, unknown>;
								const compName =
									compData.name ||
									compData.competitor_name ||
									compData.name_brand ||
									compData.nameBrand ||
									`Competitor ${compIndex + 1}`;

								return {
									id: null,
									name_brand:
										typeof compName === 'string' ? compName : `Competitor ${compIndex + 1}`,
									details: []
								};
							})
						: []
				};
			});

			if (debug) {
				console.log('Repaired data (legacy format):', JSON.stringify(newData, null, 2));
			}

			return newData;
		}

		// If we got this far, the data can't be easily repaired
		console.warn('Failed to repair data, returning default structure');
		return defaultData;
	} catch (error) {
		console.error('Error repairing analysis data:', error);
		// Return minimal valid structure
		return defaultData;
	}
}

/**
 * Maps analysis data to database entity detail records with snake_case properties
 */
export function mapAnalysisToEntityDetails(
	analysisData: AnalysisData,
	entityId: string
): Array<Record<string, unknown>> {
	const records: Array<Record<string, unknown>> = [];
	const { entity } = analysisData;

	// Helper to create a record from a detail with snake_case properties
	const createRecord = (detail: EntityDetail): Record<string, unknown> => ({
		entity_id: entityId,
		type_research_detail: mappers.detailType(detail.type_research_detail || ''),
		data_confidence: mappers.confidence(detail.data_confidence || ''),
		source_type: mappers.sourceType(detail.source_type || ''),
		as_of_date: detail.as_of_date || new Date().toISOString().split('T')[0],
		discrete_value: detail.discrete_value,
		text_value: detail.text_value,
		creator: 'openai'
	});

	// Process entity details
	if (entity.details) {
		records.push(...entity.details.map(createRecord));
	}

	// Process products and competitors
	if (entity.products) {
		entity.products.forEach((product) => {
			// Add product details
			if (product.details) {
				records.push(...product.details.map(createRecord));
			}

			// Add competitor details
			if (product.competitors) {
				product.competitors.forEach((competitor) => {
					if (competitor.details) {
						records.push(...competitor.details.map(createRecord));
					}
				});
			}
		});
	}

	return records;
}

/**
 * Transforms API/database data to UI-friendly format
 */
export function transformToEnhancedCompanyData(
	data: AnalysisData | Record<string, unknown>,
	companyName: string
): EnhancedCompanyData {
	// Process and validate the data
	let processedData: AnalysisData;
	try {
		const validationResult = validate.analysisData(data as AnalysisData);
		processedData = validationResult.isValid
			? (data as AnalysisData)
			: repairAnalysisData(data as Record<string, unknown>);
	} catch {
		// Default data with all required properties
		processedData = {
			entity: {
				id: null,
				name_brand: companyName,
				details: [],
				products: []
			},
			_meta: {
				cost: {
					totalTokens: 0,
					costUSD: 0
				}
			}
		};
	}

	// Extract basic company info
	const entityName = processedData.entity?.name_brand || companyName;
	let description = '';
	let industry = 'Technology';
	let sector = 'Software';

	// Extract text fields from details
	const entityDetails = processedData.entity?.details || [];
	for (const detail of entityDetails) {
		if (!detail.text_value) continue;

		if (detail.type_research_detail?.includes('description')) {
			description = detail.text_value;
		} else if (detail.type_research_detail?.includes('industry')) {
			industry = detail.text_value;
		} else if (detail.type_research_detail?.includes('sector')) {
			sector = detail.text_value;
		}
	}

	// Extract products
	const products = extractProducts(processedData.entity?.products || [], entityName);

	// Extract competitors
	const competitors = extractCompetitors(processedData.entity?.products || []);

	// Create analysis
	const analysis = createAnalysis(entityName, industry, competitors);

	// Return formatted data
	return {
		id: `openai-${Date.now()}`,
		slug: entityName.toLowerCase().replace(/\s+/g, '-'),
		name: entityName,
		description: description || `${entityName} provides services`,
		industry,
		sector,
		products: { productLines: products, competitors },
		analysis
	} as EnhancedCompanyData;
}

/**
 * Helper function to safely get a property from a detail object with legacy fallback
 * Helps eliminate the use of 'any' type assertions
 */
function getDetailProperty<T>(
	obj: Record<string, unknown>,
	snakeCaseKey: string,
	camelCaseKey: string,
	defaultValue: T
): T {
	if (snakeCaseKey in obj && obj[snakeCaseKey] !== undefined) {
		return obj[snakeCaseKey] as T;
	}
	if (camelCaseKey in obj && obj[camelCaseKey] !== undefined) {
		return obj[camelCaseKey] as T;
	}
	return defaultValue;
}

/**
 * Utility functions for data transformation and validation
 */
function extractProducts(products: RecursiveProductEntity[], entityName: string): ProductLine[] {
	if (!utils.isValidArray(products)) {
		return [
			{
				name: `${entityName} Main Product`,
				revenuePercentage: 100,
				growth: '0%',
				description: `Main offering by ${entityName}`
			}
		];
	}

	return products.map((product, index) => {
		let revenue = 0;
		let growth = '0%';
		let description = '';

		// Extract product details
		if (product.details) {
			for (const detail of product.details) {
				if (
					detail.type_research_detail?.includes('market_share') &&
					detail.discrete_value !== undefined
				) {
					revenue = detail.discrete_value;
				} else if (
					detail.type_research_detail?.includes('growth') &&
					detail.discrete_value !== undefined
				) {
					growth = `${detail.discrete_value}%`;
				} else if (detail.text_value && detail.type_research_detail?.includes('description')) {
					description = detail.text_value;
				}
			}
		}

		return {
			name: product.name_brand || `Product ${index + 1}`,
			revenuePercentage: revenue > 0 ? revenue : 100 / (products.length || 1),
			growth,
			description: description || `${product.name_brand || 'Product'} by ${entityName}`
		};
	});
}

/**
 * Helper function to extract competitor data
 */
function extractCompetitors(products: RecursiveProductEntity[]): Competitor[] {
	const competitorMap = new Map<string, Competitor>();

	if (!utils.isValidArray(products)) return [];

	// Collect all competitors
	for (const product of products) {
		if (
			!product.competitors ||
			!Array.isArray(product.competitors) ||
			product.competitors.length === 0
		) {
			continue;
		}

		for (const competitor of product.competitors) {
			const name = competitor.name_brand || 'Unknown Competitor';

			// Skip duplicates
			if (competitorMap.has(name)) continue;

			// Find market share
			let marketShare = 5; // Default
			if (competitor.details) {
				const marketShareDetail = competitor.details.find(
					(detail) =>
						detail.type_research_detail?.includes('market_share') &&
						detail.discrete_value !== undefined
				);
				if (marketShareDetail?.discrete_value !== undefined) {
					marketShare = marketShareDetail.discrete_value;
				}
			}

			competitorMap.set(name, {
				name,
				marketShare,
				primaryCompetition: `Competitor for ${product.name_brand || 'this product'}`
			});
		}
	}

	return Array.from(competitorMap.values());
}

/**
 * Creates default analysis data for company
 */
function createAnalysis(entityName: string, industry: string, competitors: Competitor[]) {
	return {
		// SWOT analysis
		swot: {
			strengths: [{ text: `${entityName} offers specialized services`, impact: 'medium' as const }],
			weaknesses: [{ text: 'Limited market presence', impact: 'medium' as const }],
			opportunities: [
				{ text: `Growth potential in the ${industry} sector`, impact: 'high' as const }
			],
			threats: [
				{
					text: `Competition from established players${
						competitors.length > 0 ? ` like ${competitors[0]?.name}` : ''
					}`,
					impact: 'medium' as const
				}
			]
		},

		// Porter's Five Forces
		portersFiveForces: {
			competitiveRivalry: competitors.length > 3 ? 4 : 3,
			supplierPower: 3,
			buyerPower: 3,
			threatOfSubstitutes: 3,
			threatOfNewEntrants: competitors.length > 3 ? 4 : 3
		},

		// Future scenarios
		futureScenarios: [
			{
				title: 'Market Expansion',
				probability: 0.7,
				description: `${entityName} expands its offerings to capture larger market share`,
				impact: 'high' as const
			},
			{
				title: 'Increased Competition',
				probability: 0.6,
				description: competitors[0]?.name
					? `${competitors[0].name} and other competitors introduce similar offerings`
					: 'Major players introduce competing products',
				impact: 'medium' as const
			}
		]
	};
}

// Re-export enum values
export { financialSourceTypes, marketShareSourceTypes };

/**
 * Creates mock analysis data for testing purposes
 *
 * This centralized mock data generator ensures consistency across
 * test and UI components, following the entity-based schema structure.
 *
 * @link src/lib/server/db/research/schema/entity_detail.ts - Schema structure
 * @link data-tools/sharedUtils/schemaToJson.ts - OpenAI schema definition
 *
 * @param companyName The name of the company to create mock data for
 * @returns A fully formed AnalysisData object with mock data
 */
export function createMockAnalysisData(companyName: string): AnalysisData {
	// Helper function to create entity details
	function createEntityDetail(
		type: TypeResearchDetail,
		confidence: DataConfidence,
		source: SourceType,
		value: number
	): EntityDetail {
		return {
			type_research_detail: type,
			data_confidence: confidence,
			source_type: source,
			as_of_date: new Date().toISOString().split('T')[0],
			discrete_value: value
		};
	}

	// Helper function to create competitor entities
	function createCompetitor(
		name: string,
		shareValue: number,
		confidence: DataConfidence = 'medium'
	): RecursiveProductEntity {
		return {
			id: null,
			name_brand: name,
			details: [
				createEntityDetail('market_share_estimate', confidence, 'analyst_estimate', shareValue)
			]
		};
	}

	// Helper function to create product entities
	function createProduct(
		name: string,
		year: number,
		share: number,
		competitors: RecursiveProductEntity[]
	): RecursiveProductEntity {
		return {
			id: null,
			name_brand: name,
			date_year_established: year,
			details: [
				createEntityDetail('market_share_estimate', 'high', 'analyst_estimate', share),
				createEntityDetail('market_share_max', 'high', 'industry_report', share + 10),
				createEntityDetail('market_share_min', 'high', 'industry_report', share)
			],
			competitors
		};
	}

	// Create a complete mock data structure that follows the schema
	return {
		entity: {
			id: null,
			name_brand: companyName,
			name_legal: `${companyName}, Inc.`,
			date_year_established: 2018,
			status_operating: 'Active',
			details: [
				createEntityDetail('market_size_usd', 'high', 'industry_report', 1200000000),
				createEntityDetail('employee_count_estimate', 'medium', 'analyst_estimate', 500),
				createEntityDetail('customer_count_estimate', 'medium', 'analyst_estimate', 75000)
			],
			urls: [
				{
					url_type: 'website',
					url: 'https://example.com',
					is_primary: true
				}
			],
			products: [
				createProduct('Main Product', 2019, 60, [
					createCompetitor('Competitor A', 35),
					createCompetitor('Competitor B', 25)
				]),
				createProduct('Secondary Product', 2020, 35, [createCompetitor('Competitor C', 20, 'low')])
			]
		},
		_meta: {
			cost: {
				totalTokens: 1324,
				costUSD: 0.01324
			},
			validation: 'passed'
		}
	};
}

/**
 * openai.ts
 * Core OpenAI API integration for company financial analysis
 *
 * This module handles all interactions with the OpenAI API for generating
 * structured financial and competitive analysis data. It manages the complete
 * lifecycle from prompt creation to response parsing and validation.
 *
 * This file follows DRY principles by:
 * 1. Importing types directly from database schema files
 * 2. Using centralized validation and repair functions
 * 3. Leveraging shared schema conversion utilities
 * 4. Using common OpenAI API utilities
 *
 * @link src/lib/server/db/research/schema/index.ts - Central schema index for all type definitions
 * @link data-tools/sharedUtils/dataProcessing.ts - Provides repair functions for API responses
 * @link data-tools/sharedUtils/schemaToJson.ts - Converts TypeScript schemas to OpenAI function definitions
 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - API endpoint using this module
 * @link $data-tools/sharedUtils/dataProcessing.ts - Provides repair functions for API responses
 * @link src/routes/newcompanylookup/+page.svelte - UI component using this module
 */

import { debugLog, callOpenAIWithSchema } from '../src/lib/utils/openaiApi';
import type { ChatCompletionMessageParam } from 'openai';

// Import Zod-derived types from the central schema
import type { AnalysisData } from '../src/lib/schemas/research';

// Import consolidated data processing utilities
import { repairAnalysisData, validate } from './sharedUtils/dataProcessing';

// Import schema conversion utilities that use the central schema definition
import {
	createSimplifiedAnalysisFunction,
	createBasicCompanyInfoFunction
} from './sharedUtils/schemaToJson';

/**
 * Configuration options for company analysis
 */
interface CompanyAnalysisOptions {
	apiKey?: string;
	model?: string;
	provider?: string;
	debug?: boolean;
	skipValidation?: boolean;
	sourceType?: string; // Processing level: rawOpenAI, validatedOpenAI, repairedOpenAI, transformedOpenAI
	strategy?: 'single' | 'multi'; // The analysis strategy to use: single-step or multi-step
}

/**
 * Extended metadata type that includes validation errors
 */
export interface ExtendedMetadata {
	cost?: { totalTokens: number; costUSD: number };
	validation?: string;
	validationErrors?: string[];
}

/**
 * Extended analysis data type with enhanced metadata
 */
interface ValidatedAnalysisData extends Omit<AnalysisData, '_meta'> {
	_meta?: ExtendedMetadata;
}

/**
 * Basic company information response interface
 */
interface BasicCompanyInfo {
	company_name: string;
	main_products: string[];
	main_competitors: string[];
	[key: string]: unknown;
}

/**
 * Process company analysis with OpenAI API
 *
 * This function handles the complete process of generating company analysis data,
 * including prompt creation, API calls, validation, and data repair.
 *
 * Supports two strategies:
 * 1. 'single' - Simple direct analysis (default)
 * 2. 'multi' - Multi-step approach that gets basic info first, then builds analysis
 *
 * Also supports different processing levels via sourceType:
 *   - rawOpenAI: Unprocessed OpenAI response
 *   - validatedOpenAI: After validation, before repair
 *   - repairedOpenAI: After repair, before transformation
 *   - transformedOpenAI: Default, fully processed for UI
 *
 * @param companyName Company name to analyze
 * @param options Configuration options including:
 *   - model: The LLM model to use
 *   - provider: The API provider (direct or openrouter)
 *   - skipValidation: Whether to skip validation steps
 *   - debug: Enable debug logging
 *   - sourceType: Processing level requested
 *   - strategy: 'single' or 'multi' step approach
 * @returns Analysis data for the company
 */
export async function processCompanyAnalysis(
	companyName: string,
	options: CompanyAnalysisOptions = {}
): Promise<ValidatedAnalysisData> {
	const debug = options.debug || process.env.DEBUG === 'true';
	const sourceType = options.sourceType || 'transformedOpenAI';
	const strategy = options.strategy || 'single';

	try {
		debugLog(
			`Processing analysis for ${companyName} (sourceType: ${sourceType}, strategy: ${strategy})...`,
			undefined,
			debug
		);

		// Different strategies for analysis
		let analysisData: AnalysisData;

		if (strategy === 'multi') {
			analysisData = await processMultiStepAnalysis(companyName, options);
		} else {
			analysisData = await processSingleStepAnalysis(companyName, options);
		}

		// Process based on the requested sourceType
		switch (sourceType) {
			case 'rawOpenAI':
				// For raw data, just return the unmodified data
				return analysisData as ValidatedAnalysisData;

			case 'validatedOpenAI': {
				// For validated data, run validation but don't repair
				const validationResult = validate.analysisData(analysisData);
				return {
					...analysisData,
					_meta: {
						...analysisData._meta,
						validation: validationResult.isValid ? 'passed' : 'failed',
						validationErrors: validationResult.isValid ? [] : validationResult.errors
					}
				};
			}

			case 'repairedOpenAI': {
				// For repaired data, validate and repair explicitly
				const validationResult = validate.analysisData(analysisData);
				const metadata: ExtendedMetadata = {
					...analysisData._meta,
					validation: validationResult.isValid ? 'valid_at_source' : 'repaired'
				};

				// Update metadata in the repaired data
				return validationResult.isValid
					? { ...analysisData, _meta: metadata }
					: { ...repairAnalysisData(analysisData, debug), _meta: metadata };
			}

			case 'transformedOpenAI':
			default:
				// Apply common post-processing for the default transformed data
				return finalizeAnalysisData(analysisData, options) as ValidatedAnalysisData;
		}
	} catch (error: unknown) {
		debugLog(`Error analyzing company ${companyName}:`, error, true);
		throw error;
	}
}

/**
 * Internal helper: Apply common post-processing to analysis data
 * Centralizes validation and repair to avoid duplication
 *
 * @param analysisData Raw analysis data to process
 * @param options Configuration options
 * @returns Processed analysis data
 * @private
 */
function finalizeAnalysisData(
	analysisData: AnalysisData,
	options: CompanyAnalysisOptions = {}
): ValidatedAnalysisData {
	const debug = options.debug || false;
	const skipValidation = options.skipValidation || false;

	// If validation is required, repair the data and add validation metadata
	if (!skipValidation) {
		// Validate and repair the data
		const repairedData = repairAnalysisData(analysisData, debug);

		// Add validation metadata
		if (repairedData._meta) {
			repairedData._meta.validation = 'repaired';
		}

		return repairedData as ValidatedAnalysisData;
	}

	// Even if validation is skipped, ensure minimal structure
	return analysisData as ValidatedAnalysisData;
}

/**
 * Internal helper: Process company analysis using single-step approach
 *
 * @param companyName Company name to analyze
 * @param options Configuration options
 * @returns Analysis data for the company
 * @private
 */
async function processSingleStepAnalysis(
	companyName: string,
	options: CompanyAnalysisOptions = {}
): Promise<AnalysisData> {
	const debug = options.debug || false;

	// Define system and user messages directly
	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: `You are an expert financial analyst with deep knowledge about companies, markets, and competitive landscapes.
Your task is to provide structured financial and competitive analysis of ${companyName}.
Focus on accurate market positioning, competitors, and key metrics.
Structure your response exactly according to the provided JSON schema.`
		},
		{
			role: 'user',
			content: `Perform a comprehensive competitive analysis of ${companyName}.

Please analyze the company's market position, key products, and main competitors.

For each product, identify:
1. The product's name and main features
2. Its market positioning and target audience
3. Key competitive advantages and weaknesses
4. The main competitor products and companies

Return this information structured as a complete JSON object following the schema provided in the function.`
		}
	];

	// Get the analysis function from schemaToJson
	const analysisFunction = createSimplifiedAnalysisFunction();

	try {
		// Use the centralized schema-based API call utility
		const { data: parsedData, cost } = await callOpenAIWithSchema<AnalysisData>({
			messages,
			schema: analysisFunction.parameters,
			functionName: analysisFunction.name,
			options: {
				model: options.model || process.env.LLM_MODEL || 'chatgpt-4o-latest',
				provider: options.provider || process.env.LLM_PROVIDER || 'direct',
				apiKey: options.apiKey,
				temperature: 0.1,
				debug,
				skipValidation: options.skipValidation,
				validateFn: validate.analysisData
			}
		});

		// Add cost information to the data
		if (!parsedData._meta) {
			parsedData._meta = {} as NonNullable<AnalysisData['_meta']>;
		}

		parsedData._meta.cost = {
			totalTokens: cost.totalTokens,
			costUSD: cost.costUSD
		};

		return parsedData;
	} catch (error) {
		debugLog(`Error in processSingleStepAnalysis for ${companyName}:`, error, true);
		throw error;
	}
}

/**
 * Internal helper: Process company analysis using multi-step approach
 *
 * This more advanced function breaks down the analysis process into multiple steps:
 * 1. Get basic company info
 * 2. Use that info to generate a complete analysis
 *
 * @param companyName Company name to analyze
 * @param options Configuration options
 * @returns Analysis data for the company
 * @private
 */
async function processMultiStepAnalysis(
	companyName: string,
	options: CompanyAnalysisOptions = {}
): Promise<AnalysisData> {
	const debug = options.debug || false;

	// Step 1: Get basic company information
	const basicInfo = await getBasicCompanyInfo(companyName, {
		...options,
		debug
	});

	// Initialize the analysis data structure with new schema format using snake_case
	const analysisData: AnalysisData = {
		entity: {
			id: null,
			name_brand: basicInfo.company_name,
			products: [],
			details: []
		},
		_meta: {
			cost: {
				totalTokens: basicInfo.cost.totalTokens,
				costUSD: basicInfo.cost.costUSD
			}
		}
	};

	// Step 2: Add products to the analysis
	if (analysisData.entity && basicInfo.main_products.length > 0) {
		for (const productName of basicInfo.main_products) {
			try {
				debugLog(`Adding product: ${productName}`, undefined, debug);
				if (analysisData.entity.products) {
					analysisData.entity.products.push({
						id: null,
						name_brand: productName,
						details: [
							{
								type_research_detail: 'market_share_estimate',
								data_confidence: 'high',
								source_type: 'analyst_estimate',
								as_of_date: new Date().toISOString().split('T')[0],
								text_value: `Product offered by ${companyName}`
							}
						],
						competitors: basicInfo.main_competitors.map((competitor) => ({
							id: null,
							name_brand: competitor,
							details: []
						}))
					});
				}
			} catch (error) {
				debugLog(`Error adding product ${productName}: ${error}`, undefined, true);
			}
		}
	}

	return analysisData;
}

/**
 * Gets basic information about a company including products and competitors
 *
 * @param companyName Company name to get info for
 * @param options Configuration options
 * @returns Basic company information
 * @private
 */
async function getBasicCompanyInfo(
	companyName: string,
	options: CompanyAnalysisOptions = {}
): Promise<{
	company_name: string;
	main_products: string[];
	main_competitors: string[];
	cost: { totalTokens: number; costUSD: number };
}> {
	const debug = options.debug || process.env.DEBUG === 'true';
	debugLog(`Getting basic info for ${companyName}`, undefined, debug);

	// Define the function schema for basic company info
	const infoFunction = createBasicCompanyInfoFunction();

	try {
		// Create messages array with simplified prompt
		const messages: ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: `You are a business analyst who specializes in company research. 
Provide basic information about ${companyName} including the company name, main products/services, and key competitors.
Keep your response brief and structured according to the function schema.`
			},
			{
				role: 'user',
				content: `What are the main products/services of ${companyName} and who are their key competitors?`
			}
		];

		// Use the centralized schema-based API call utility
		const { data, cost } = await callOpenAIWithSchema<BasicCompanyInfo>({
			messages,
			schema: infoFunction.parameters,
			functionName: infoFunction.name,
			options: {
				model: options.model || process.env.LLM_MODEL || 'chatgpt-4o-latest',
				provider: options.provider || process.env.LLM_PROVIDER || 'direct',
				apiKey: options.apiKey,
				temperature: 0.1,
				debug
			}
		});

		return {
			company_name: data.company_name || companyName,
			main_products: Array.isArray(data.main_products) ? data.main_products : [],
			main_competitors: Array.isArray(data.main_competitors) ? data.main_competitors : [],
			cost
		};
	} catch (error) {
		debugLog(`Error getting basic company info for ${companyName}:`, error, true);
		// Provide default values on error to allow analysis to continue
		return {
			company_name: companyName,
			main_products: [],
			main_competitors: [],
			cost: { totalTokens: 0, costUSD: 0 }
		};
	}
}

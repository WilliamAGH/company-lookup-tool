/**
 * Company Competitive Analysis API Endpoint - CENTRAL IMPLEMENTATION
 *
 * This API endpoint handles requests for competitive analysis data using the LLM pipeline.
 * It follows DRY principles by using the centralized:
 * 1. Schema definitions
 * 2. Validation and repair functions
 * 3. Data transformation logic
 *
 * Request format:
 * GET /api/rest/v1/company/competitive-analysis?name={companyName}&param2={value}
 *
 * @link src/lib/server/db/research/schema/index.ts - Central schema definitions
 * @link data-tools/sharedUtils/dataProcessing.ts - Data validation, repair and transformation functions
 * @link data-tools/openai.ts - LLM processing functions - Single source of truth for OpenAI processing
 */

import type { RequestEvent } from '@sveltejs/kit';
import { apiHandler, errorResponse, successResponse } from '$lib/server/api/utils';
import { processCompanyAnalysis } from '$data-tools/openai';
import type { AnalysisData } from '$lib/schemas/research';
import {
	convertLiteralNewlines as convertNewlines,
	customStringify as stringifyWithNewlines
} from '$lib/utils/prettifyJson.js';
import {
	type OpenAIErrorDetails,
	type OpenAIError as OpenAIAPIError
} from '$lib/utils/openaiApi.js';

/**
 * Main API handler for competitive analysis requests
 *
 * This endpoint processes requests for company competitive analysis using the
 * centralized data pipeline. It offers different processing levels from raw
 * OpenAI responses to fully validated and transformed data.
 *
 * Query parameters:
 * @param {string} name - Required - Company name to analyze
 * @param {string} sourceType - Optional - Processing level:
 *   - rawOpenAI: Unprocessed OpenAI response
 *   - validatedOpenAI: After validation, before repair
 *   - repairedOpenAI: After repair, before transformation
 *   - transformedOpenAI: Default, fully processed for UI
 * @param {string} validation - Optional - 'on' (default) or 'off'
 * @param {string} debug - Optional - 'on' or 'off' (default)
 * @param {string} approach - Optional - 'single' (default) or 'multi' step
 *
 * @returns {Response} JSON response with company analysis data
 */
export async function GET(event: RequestEvent) {
	const { url } = event;
	const companyName = url.searchParams.get('name');
	const sourceType = url.searchParams.get('sourceType') || 'transformedOpenAI';
	const enableDebug = url.searchParams.get('debug') === 'on';
	const validation = url.searchParams.get('validation') !== 'off'; // Default ON unless explicit OFF
	const strategy = url.searchParams.get('approach') || 'single';

	// Validate company name
	if (!companyName) {
		return errorResponse(
			'Company name is required',
			400,
			undefined,
			'/api/rest/v1/company/competitive-analysis?name=Apple',
			event
		);
	}

	console.log(
		`[API] Request: ${companyName} (sourceType: ${sourceType}, debug: ${enableDebug ? 'on' : 'off'}, validation: ${validation ? 'on' : 'off'}, strategy: ${strategy})`
	);

	// Standard handler using centralized processing
	return apiHandler(async () => {
		try {
			// Common options for all paths - pass through to the centralized processCompanyAnalysis
			const options = {
				debug: enableDebug,
				skipValidation: !validation,
				provider: process.env.LLM_PROVIDER,
				sourceType, // Pass this through to centralized function
				strategy: strategy as 'single' | 'multi'
			};

			// Call the centralized company analysis function which handles all source types
			const analysisData = await processCompanyAnalysis(companyName, options);

			// Log cost info
			if (analysisData._meta?.cost) {
				console.log(
					`[API] Cost for ${companyName}: $${analysisData._meta.cost.costUSD.toFixed(6)} (${analysisData._meta.cost.totalTokens.toLocaleString()} tokens)`
				);
			}

			// Special formatting for raw response only
			if (sourceType === 'rawOpenAI') {
				return formatRawResponse(analysisData, companyName);
			}

			// For all other cases, use standard success response
			return successResponse(analysisData, event);
		} catch (error) {
			return handleApiError(error, companyName, event);
		}
	})(event);
}

/**
 * Centralized error handler for API responses
 * Consolidates error handling logic to avoid duplication
 */
function handleApiError(error: unknown, companyName: string, event: RequestEvent) {
	console.error(`[API] Error analyzing ${companyName}:`, error);

	// Standard error response logic
	const errorMessage = error instanceof Error ? error.message : 'Unknown error';
	const isValidationError = errorMessage.includes('Invalid analysis data');

	// OpenAI error detection
	const openaiError = error as Partial<OpenAIAPIError>;
	if (
		openaiError.status === 429 ||
		openaiError.code === 'insufficient_quota' ||
		(openaiError.error as OpenAIErrorDetails)?.type === 'insufficient_quota'
	) {
		return errorResponse(
			'OpenAI API quota exceeded',
			429,
			'API quota limit reached. Please check billing details or try again later.',
			undefined,
			event
		);
	}

	return errorResponse(
		isValidationError ? 'Validation failed' : 'Failed to analyze company',
		isValidationError ? 400 : 500,
		errorMessage,
		undefined,
		event
	);
}

/**
 * Formats analysis data as a raw OpenAI response
 * Preserves newlines and adds cost information
 */
function formatRawResponse(analysisData: AnalysisData, companyName: string) {
	// Create a simpler response object with available data
	const debugResponse = convertNewlines({
		request: {
			company_name: companyName,
			model: process.env.LLM_MODEL || 'unknown'
		},
		response: {
			// Include whatever data we have from analysis
			data: analysisData,
			// Include cost information if available
			usage: analysisData._meta?.cost
				? {
						total_tokens: analysisData._meta.cost.totalTokens,
						costUSD: analysisData._meta.cost.costUSD
					}
				: undefined
		}
	});

	// Use custom stringification to preserve newlines
	return new Response(
		stringifyWithNewlines({
			success: true,
			data: debugResponse
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}

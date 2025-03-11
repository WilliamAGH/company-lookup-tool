#!/usr/bin/env node

/**
 * Company Analysis CLI Tool
 *
 * This script provides a command-line interface for analyzing companies.
 * It leverages the OpenAI API to generate detailed financial and competitive analysis.
 *
 * Usage:
 *   bun data-tools/companyAnalysis.ts <company-name> [--multi]
 *   bun data-tools/companyAnalysis.ts --dump-schema
 *
 * Options:
 *   <company-name>   Name of the company to analyze
 *   --multi          Use multi-step approach for more reliable results
 *   --debug          Enable detailed debug logging
 *   --dump-schema    Outputs the OpenAI function schema to examples/schema_YYYYMMDD_HHMMSS.json
 *   --provider=X     Specify the provider: 'direct' (OpenAI) or 'openrouter' (default: use LLM_PROVIDER env var)
 *
 * Examples:
 *   bun data-tools/companyAnalysis.ts Apple                     # Analyze Apple with single-step approach
 *   bun data-tools/companyAnalysis.ts Microsoft --multi         # Analyze Microsoft with multi-step approach
 *   bun data-tools/companyAnalysis.ts Apple --provider=openrouter # Use OpenRouter provider
 *   bun data-tools/companyAnalysis.ts --dump-schema             # Just save the schema to a file without making API calls
 *
 * @link openai.ts - Core AI processing functionality
 * @link validation.ts - Data validation utilities
 * @link src/lib/server/db/research/schema/entity_detail.ts - Type definitions and schemas
 * @link sharedUtils/openaiApi.ts - Generic OpenAI API utilities
 * @link src/routes/api/rest/v1/company/competitive-analysis/+server.ts - API endpoint using this functionality
 */

import { processCompanyAnalysis } from './openai.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { createSimplifiedAnalysisFunction } from './sharedUtils/schemaToJson.js';

// Load environment variables from .env file
console.log('Loading environment variables...');
dotenv.config();

// Debug: Print API key status (without revealing the key)
console.log(`OpenAI API Key set: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);

/**
 * Dumps the OpenAI function schema to a file with timestamp
 *
 * This is useful for debugging and understanding what schema is being sent to OpenAI
 *
 * @returns {Promise<string>} Path to the created file
 */
async function dumpSchemaToFile() {
	// Get current datetime for filename
	const now = new Date();
	const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];

	const filename = `schema_${timestamp}.json`;
	const examplesDir = join(dirname(fileURLToPath(import.meta.url)), 'examples');
	const filepath = join(examplesDir, filename);

	// Get the schema
	const functionDef = createSimplifiedAnalysisFunction();
	const schemaJson = JSON.stringify(functionDef, null, 2);

	// Ensure examples directory exists
	try {
		await mkdir(examplesDir, { recursive: true });
	} catch (err) {
		// Type check the error before accessing properties
		if (err && typeof err === 'object' && 'code' in err && err.code !== 'EEXIST') {
			throw err;
		}
	}

	// Write to file
	await writeFile(filepath, schemaJson);
	console.log(`Schema written to: ${filepath}`);

	return filepath;
}

/**
 * Analyzes a company and returns the financial analysis
 * This is a thin wrapper around the core processing functions in openai.ts
 * that adds CLI-specific formatting and logging.
 *
 * @param {string} companyName - The name of the company to analyze
 * @param {boolean} useMultiStep - Whether to use the multi-step approach for more reliable results
 * @param {boolean} enableDebug - Whether to enable debug logging
 * @param {string} provider - Optional provider to use ('direct' or 'openrouter')
 * @returns {Promise<Object>} The parsed financial analysis data with cost information
 * @link $lib/server/db/research/openai.ts - Uses processCompanyAnalysis with strategy option for core functionality
 */
async function analyzeCompany(
	companyName: string,
	useMultiStep: boolean = false,
	enableDebug: boolean = false,
	provider?: string
) {
	console.log('Starting analyzeCompany function...');
	try {
		console.log(`Analyzing ${companyName}${useMultiStep ? ' using multi-step approach' : ''}...`);

		// Use the consolidated function with the appropriate strategy based on the parameter
		const analysisData = await processCompanyAnalysis(companyName, {
			debug: enableDebug,
			provider,
			strategy: useMultiStep ? 'multi' : 'single'
		});

		// Print the analysis in a formatted way (CLI-specific functionality)
		console.log('\n===== COMPANY FINANCIAL ANALYSIS =====\n');
		console.log(`Company: ${companyName}`);
		console.log(JSON.stringify(analysisData, null, 2));
		console.log('\n======================================\n');

		// Print cost information
		if (analysisData._meta?.cost) {
			console.log(`Total tokens used: ${analysisData._meta.cost.totalTokens}`);
			console.log(`Estimated cost: $${analysisData._meta.cost.costUSD.toFixed(6)}`);
		}

		return analysisData;
	} catch (error) {
		console.error('Error analyzing company:', error);
		if (error instanceof Error) {
			console.error('Error message:', error.message);
			console.error('Error stack:', error.stack);
		}
		if (error && typeof error === 'object' && 'response' in error) {
			console.error('API Error response:', error.response);
		}
		throw error;
	}
}

// Determine if this script is being run directly
// This works with both Node.js and Bun
console.log('Checking if script is run directly...');
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
console.log(`Is main module: ${isMainModule}`);

if (isMainModule) {
	console.log('Script is run directly.');

	// Parse command line arguments
	const args = process.argv.slice(2);
	const useMultiStep = args.includes('--multi');
	const enableDebug = args.includes('--debug');
	const dumpSchema = args.includes('--dump-schema');

	// Find provider argument if specified (--provider=X format)
	let provider: string | undefined;
	const providerArg = args.find((arg) => arg.startsWith('--provider='));
	if (providerArg) {
		provider = providerArg.split('=')[1];
		console.log(`Using specified provider: ${provider}`);
	} else {
		// Use environment variable
		provider = process.env.LLM_PROVIDER;
		console.log(`Using provider from environment: ${provider || 'not set, defaulting to direct'}`);
	}

	// Handle --dump-schema flag
	if (dumpSchema) {
		console.log('Dumping schema to file...');
		dumpSchemaToFile()
			.then((filepath) => {
				console.log(`Schema successfully written to: ${filepath}`);
				process.exit(0);
			})
			.catch((err) => {
				console.error('Error dumping schema:', err);
				process.exit(1);
			});
	} else {
		// Remove flags from arguments to get the company name
		const companyName = args.filter((arg) => !arg.startsWith('--'))[0] || 'Apple';

		console.log(`Company name from arguments: ${companyName}`);
		console.log(`Using multi-step approach: ${useMultiStep}`);
		console.log(`Debug mode: ${enableDebug}`);

		console.log('Calling analyzeCompany function...');
		analyzeCompany(companyName, useMultiStep, enableDebug, provider)
			.then(() => console.log('Analysis complete!'))
			.catch((err) => {
				console.error('Failed to complete analysis:', err);
				process.exit(1);
			});
	}
} else {
	console.log('Script is imported as a module.');
}

// Export the function for use in other modules
export { analyzeCompany, dumpSchemaToFile };

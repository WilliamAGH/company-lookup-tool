/**
 * openaiApi.ts
 * Streamlined LLM API utilities for making OpenAI-compatible API calls
 *
 * This module provides core functions for:
 * 1. Making API calls to OpenAI or OpenRouter
 * 2. Parsing and validating JSON responses
 * 3. Structured schema-based requests
 */

import OpenAI from 'openai';
import type {
	ChatCompletionMessageParam,
	ChatCompletion,
	ChatCompletionCreateParams
} from 'openai';
import type { LLMModels } from '$lib/types/openaiApi';
import type { ApiCost } from '../types/openaiApi';

// Re-export useful types
export type { CompletionUsage, OpenAIErrorDetails, OpenAIError } from '$lib/types/openaiApi';

// Import OpenRouter-specific utilities
import {
	OpenRouterProvider,
	formatModelNameForOpenRouter,
	prepareOpenRouterRequest,
	processOpenRouterResponse
} from '$data-tools/providers/openrouter';

// Basic model configuration with reasonable defaults
const defaultModelConfig = {
	max_tokens: 4000,
	max_input_tokens: 200000,
	max_output_tokens: 4000,
	input_cost_per_token: 0.00001,
	output_cost_per_token: 0.00003
};

// Initialize model configurations
const llmModels: LLMModels = {
	'chatgpt-4o-latest': {
		max_tokens: 4000,
		max_input_tokens: 200000,
		max_output_tokens: 4000,
		input_cost_per_token: 0.00001,
		output_cost_per_token: 0.00003
	}
};

// Import the model configuration from a consistent location
try {
	import('$data-tools/providers/llmModels.json')
		.then((module) => {
			// Update the models from the imported data
			Object.assign(llmModels, module.default);
		})
		.catch((error) => {
			console.warn('Failed to load LLM models configuration, using defaults:', error);
		});
} catch (error) {
	console.warn('Error importing LLM models configuration:', error);
}

// Provider configurations with specific keys
const providers = {
	direct: {
		name: 'Direct Provider',
		baseUrl: 'https://api.openai.com/v1',
		apiKeyEnvVar: 'OPENAI_API_KEY',
		headers: {}
	},
	openrouter: OpenRouterProvider
} as const;

// Valid provider names for type safety
type ProviderName = keyof typeof providers;

/**
 * Creates an OpenAI client configured for the requested provider
 */
function getClient(providerName: string = 'direct', apiKey?: string): OpenAI {
	// Type check the provider name
	const validProviderName = (
		Object.keys(providers).includes(providerName) ? providerName : 'direct'
	) as ProviderName;

	const provider = providers[validProviderName];
	const key =
		apiKey || (typeof process !== 'undefined' ? process.env[provider.apiKeyEnvVar] : undefined);

	if (!key) {
		throw new Error(`API key not found for provider ${providerName}`);
	}

	return new OpenAI({
		apiKey: key,
		baseURL: provider.baseUrl,
		defaultHeaders: {
			...(provider.headers || {}),
			'x-no-stream': 'true',
			'content-type': 'application/json'
		},
		defaultQuery: {
			stream: 'false'
		},
		maxRetries: 2,
		timeout: 120000,
		dangerouslyAllowBrowser: false
	});
}

/**
 * Logs debug messages when enabled
 * - Safe for both server and browser environments
 */
export function debugLog(message: string, data?: unknown, isDebug = true): void {
	// Always log in debug mode, regardless of environment
	if (
		!isDebug ||
		(typeof window === 'undefined' &&
			typeof process !== 'undefined' &&
			process.env?.DEBUG === 'true')
	) {
		console.log(`[LLM] ${message}`);
		if (data !== undefined) {
			console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
		}
	}
}

/**
 * Simple utility to safely parse JSON
 */
export function safeParseJson<T>(jsonString: string | null, debug = false): T | null {
	if (!jsonString) {
		return null;
	}

	try {
		return JSON.parse(jsonString) as T;
	} catch (error) {
		debugLog(`JSON parse error: ${(error as Error).message}`, jsonString, debug);
		return null;
	}
}

/**
 * Extracts JSON from various LLM response formats
 * Handles tool calls, function calls, and plain content
 */
export function extractJSONFromLLMResponse(response: ChatCompletion, debug = false): unknown {
	const message = response.choices?.[0]?.message;
	if (!message) {
		throw new Error('No message found in LLM response');
	}

	let parsedData: unknown = null;

	// Try tool_calls arguments first (modern OpenAI API format)
	if (message.tool_calls && message.tool_calls.length > 0) {
		try {
			const toolCall = message.tool_calls.find((tc) => tc.type === 'function');
			if (toolCall && toolCall.type === 'function') {
				debugLog('Found tool_calls arguments', undefined, debug);
				parsedData = safeParseJson(toolCall.function.arguments, debug);
			}
		} catch (error) {
			console.error('Error parsing tool call arguments:', error);
		}
	}

	// Then try function_call arguments (legacy OpenAI format)
	if (!parsedData && message.function_call?.arguments) {
		try {
			debugLog('Found function_call arguments', undefined, debug);
			parsedData = safeParseJson(message.function_call.arguments, debug);
		} catch (error) {
			console.error('Error parsing function call arguments:', error);
		}
	}

	// Finally try content field as JSON (used by some providers)
	if (!parsedData && message.content) {
		try {
			debugLog('Found content field, parsing as JSON', undefined, debug);
			parsedData = safeParseJson(message.content, debug);
		} catch (error) {
			console.error('Error parsing JSON content:', error);
		}
	}

	if (!parsedData) {
		throw new Error('Could not extract valid JSON content from LLM response');
	}

	return parsedData;
}

/**
 * Extracts and parses JSON from OpenAI response with optional validation
 */
export function parseOpenAIResponse<T = Record<string, unknown>>(
	response: ChatCompletion,
	debug = false,
	validateFn?: (data: unknown) => { isValid: boolean; errors?: string[] }
): T {
	const parsedData = extractJSONFromLLMResponse(response, debug);

	// Apply validation if provided
	if (validateFn && parsedData) {
		const validationResult = validateFn(parsedData);
		if (!validationResult.isValid) {
			const errorMsg = `Validation failed: ${
				validationResult.errors ? validationResult.errors.join(', ') : 'unknown errors'
			}`;
			console.error(errorMsg);
			debugLog('Validation failed, returning potentially invalid data', undefined, debug);
		}
	}

	return parsedData as T;
}

/**
 * Check if a model is available in our configuration
 */
export function isValidModel(modelName: string): boolean {
	return !!llmModels[modelName];
}

/**
 * Get a list of available model names
 */
export function getAvailableModels(): string[] {
	return Object.keys(llmModels);
}

/**
 * Core API call function that works with both OpenAI and OpenRouter
 */
export async function callOpenAI(
	params: {
		model?: string;
		messages: ChatCompletionMessageParam[];
		tools?: ChatCompletionCreateParams['tools'];
		tool_choice?: ChatCompletionCreateParams['tool_choice'];
		response_format?: ChatCompletionCreateParams['response_format'];
		temperature?: number;
		max_tokens?: number;
	},
	options: {
		provider?: string; // 'direct' or 'openrouter'
		apiKey?: string;
		debug?: boolean;
		max_tokens?: number;
	} = {}
): Promise<{
	response: ChatCompletion;
	cost: { totalTokens: number; costUSD: number };
}> {
	const {
		provider = typeof process !== 'undefined' && process.env?.LLM_PROVIDER
			? process.env.LLM_PROVIDER
			: 'direct',
		apiKey,
		debug = typeof process !== 'undefined' && process.env?.DEBUG === 'true',
		max_tokens = 4000
	} = options;

	// Validate the provider is one we support
	const validProvider = Object.keys(providers).includes(provider) ? provider : 'direct';

	try {
		// Create client for specified provider
		const client = getClient(validProvider, apiKey);

		// Get default model if not provided
		const defaultModel =
			typeof process !== 'undefined' && process.env?.LLM_MODEL
				? process.env.LLM_MODEL
				: 'chatgpt-4o-latest';
		const modelName = params.model || defaultModel;

		// Create a working copy of params
		let requestParams = { ...params };

		// Apply provider-specific transformations
		let finalModel = modelName;
		if (validProvider === 'openrouter') {
			finalModel = formatModelNameForOpenRouter(modelName);

			// Create a params object with a defined model for OpenRouter
			const openRouterParams = {
				...requestParams,
				model: finalModel
			};

			// Apply OpenRouter-specific transformations
			requestParams = prepareOpenRouterRequest(openRouterParams);
		}

		// Prepare final parameters
		const finalParams: ChatCompletionCreateParams = {
			model: finalModel,
			messages: requestParams.messages,
			...(requestParams.tools && { tools: requestParams.tools }),
			...(requestParams.tool_choice && { tool_choice: requestParams.tool_choice }),
			...(requestParams.temperature && { temperature: requestParams.temperature }),
			max_tokens: requestParams.max_tokens || max_tokens,
			response_format: requestParams.response_format || { type: 'json_object' },
			stream: false
		};

		// Log request in debug mode
		debugLog(
			`Calling ${validProvider} API with model ${finalModel}`,
			{
				...finalParams,
				messages: finalParams.messages.map((m) => ({
					role: m.role,
					content:
						typeof m.content === 'string'
							? `${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`
							: m.content
				}))
			},
			debug
		);

		// Make the API request
		const result = await client.chat.completions.create(finalParams);

		// Process response for OpenRouter compatibility if needed
		const processedResponse =
			validProvider === 'openrouter' ? processOpenRouterResponse(result) : result;

		// Calculate cost based on model information
		const modelConfig = llmModels[modelName] || defaultModelConfig;
		const usage = processedResponse.usage;
		const totalTokens = usage?.total_tokens || 0;
		const inputTokens = usage?.prompt_tokens || 0;
		const outputTokens = usage?.completion_tokens || 0;

		const costUSD =
			inputTokens * (modelConfig.input_cost_per_token || defaultModelConfig.input_cost_per_token) +
			outputTokens *
				(modelConfig.output_cost_per_token || defaultModelConfig.output_cost_per_token);

		// Log response and cost
		debugLog(
			`Response received. Tokens: ${totalTokens}, Cost: $${costUSD.toFixed(6)}`,
			{ firstMessage: processedResponse.choices[0]?.message, usage },
			debug
		);

		return {
			response: processedResponse,
			cost: { totalTokens, costUSD }
		};
	} catch (error: unknown) {
		// Basic error handling
		if (error instanceof Error) {
			console.error(`Error calling ${validProvider} API:`, error);
		} else {
			console.error(`Unknown error calling ${validProvider} API:`, error);
		}
		throw error;
	}
}

/**
 * Enhances message with JSON schema expectations for OpenRouter
 *
 * OpenRouter doesn't support function calling directly, so we inject
 * the schema into the user message as plain text
 *
 * @param messages Array of chat messages
 * @param schema Schema to inject
 * @returns Enhanced messages with schema
 */
function enhanceMessageWithSchema(
	messages: ChatCompletionMessageParam[],
	schema: Record<string, unknown>
): ChatCompletionMessageParam[] {
	// Create a copy of messages to enhance
	const enhancedMessages = [...messages];

	// Find the last user message
	const lastMessageIndex = enhancedMessages.findIndex(
		(msg, index) => msg.role === 'user' && index === messages.length - 1
	);

	if (lastMessageIndex >= 0) {
		const userMessage = enhancedMessages[lastMessageIndex];
		enhancedMessages[lastMessageIndex] = {
			...userMessage,
			content:
				typeof userMessage.content === 'string'
					? `${userMessage.content}\n\nIMPORTANT: Your response MUST be a valid JSON object with the following structure:\n${JSON.stringify(schema, null, 2)}`
					: userMessage.content
		};
	}

	return enhancedMessages;
}

/**
 * Function to call OpenAI with a JSON schema for structured responses
 */
export async function callOpenAIWithSchema<T>({
	messages,
	schema,
	functionName,
	options = {}
}: {
	messages: ChatCompletionMessageParam[];
	schema: Record<string, unknown>;
	functionName: string;
	options?: {
		model?: string;
		provider?: string;
		apiKey?: string;
		temperature?: number;
		debug?: boolean;
		skipValidation?: boolean;
		validateFn?: (data: unknown) => { isValid: boolean; errors?: string[] };
	};
}): Promise<{
	data: T;
	cost: { totalTokens: number; costUSD: number };
}> {
	const {
		model = typeof process !== 'undefined' && process.env?.LLM_MODEL
			? process.env.LLM_MODEL
			: 'chatgpt-4o-latest',
		provider = typeof process !== 'undefined' && process.env?.LLM_PROVIDER
			? process.env.LLM_PROVIDER
			: 'direct',
		apiKey,
		temperature = 0,
		debug = typeof process !== 'undefined' && process.env?.DEBUG === 'true',
		skipValidation = false,
		validateFn
	} = options;

	// Validate the provider is one we support
	const validProvider = Object.keys(providers).includes(provider) ? provider : 'direct';

	try {
		// Create function tool with schema
		const functionTool = {
			type: 'function' as const,
			function: {
				name: functionName,
				description: `Generate structured data for ${functionName}`,
				parameters: schema
			}
		};

		// For OpenRouter, enhance the messages with schema
		let enhancedMessages = messages;
		if (validProvider === 'openrouter') {
			enhancedMessages = enhanceMessageWithSchema(messages, schema);
		}

		// Configure API call parameters
		const extendedParams = {
			model,
			messages: enhancedMessages,
			// Include tools for direct OpenAI calls
			...(validProvider !== 'openrouter'
				? {
						tools: [functionTool],
						tool_choice: { function: { name: functionName } }
					}
				: {}),
			temperature,
			response_format: { type: 'json_object' }
		};

		// Make the API call
		const { response, cost } = await callOpenAI(extendedParams, {
			provider: validProvider,
			apiKey,
			debug
		});

		// Extract JSON from response
		const parsedData = extractJSONFromLLMResponse(response, debug);

		// Apply validation if needed
		if (validateFn && !skipValidation && parsedData) {
			const validationResult = validateFn(parsedData);
			if (!validationResult.isValid) {
				debugLog(
					`Validation issues found: ${validationResult.errors?.join(', ')}`,
					undefined,
					debug
				);
			}
		}

		return { data: parsedData as T, cost };
	} catch (error) {
		console.error(`Error in callOpenAIWithSchema:`, error);
		throw error;
	}
}

/**
 * Extract API cost information from various response formats
 * - Browser-safe implementation
 *
 * @param data API response data (from any endpoint that includes cost info)
 * @returns Cost object with totalTokens and costUSD or null if not found
 */
export function extractApiCost(data: unknown): ApiCost | null {
	try {
		if (data === null || data === undefined) return null;

		// Type guard for object check
		if (typeof data !== 'object') return null;

		// Now we know data is an object (but could be array, which is fine for next check)
		const dataObj = data as Record<string, unknown>;

		// Try to find cost in various locations through type-safe access
		const responseData = dataObj.data as Record<string, unknown> | undefined;
		const metaInData = responseData?._meta as Record<string, unknown> | undefined;
		const metaDirectly = dataObj._meta as Record<string, unknown> | undefined;

		// Get cost from either location
		const costObject = (metaInData?.cost || metaDirectly?.cost) as ApiCost | undefined;

		if (costObject?.totalTokens !== undefined && typeof costObject.costUSD === 'number') {
			// Use a browser-safe version of debugging
			console.log(
				`API cost: $${costObject.costUSD.toFixed(6)} (${costObject.totalTokens.toLocaleString()} tokens)`
			);
			return costObject;
		}

		return null;
	} catch (error) {
		console.error('Error extracting API cost:', error);
		return null;
	}
}

/**
 * openrouter.ts
 * OpenRouter-specific integration for LLM API calls
 *
 * This module provides OpenRouter-specific configuration, transformations,
 * and utilities for making API calls to OpenRouter while maintaining
 * OpenAI-compatible interface patterns.
 *
 * IMPORTANT: OpenRouter has issues with streaming responses - it tends to return
 * streaming responses even when explicitly configured not to. This implementation
 * uses multiple strategies to prevent this behavior.
 *
 * NOTE: Always use direct type imports with OpenAI:
 * import type { ChatCompletionCreateParams } from 'openai';
 * NOT namespace notation (OpenAI.ChatCompletion)
 *
 * @link https://openrouter.ai/docs - OpenRouter API documentation
 * @link docs/openrouter.md - OpenRouter documentation
 * @link data-tools/sharedUtils/openaiApi.ts - OpenAI API integration
 */

import type { ChatCompletionCreateParams, ChatCompletion } from 'openai';

/**
 * OpenRouter-specific provider configuration
 */
export interface OpenRouterProviderConfig {
	require_parameters?: boolean;
	sort?: 'price' | 'latency' | 'throughput';
	order?: string[];
	allow_fallbacks?: boolean;
	data_collection?: 'allow' | 'deny';
	ignore?: string[];
	// disable_streaming is NOT supported by OpenRouter
}

/**
 * OpenRouter provider configuration with API details
 */
export const OpenRouterProvider = {
	name: 'OpenRouter',
	baseUrl: 'https://openrouter.ai/api/v1',
	apiKeyEnvVar: 'OPENROUTER_API_KEY',
	headers: {
		'X-No-Stream': 'true', // Signal no streaming
		'X-API-Control': 'sync-only', // Request synchronous-only processing
		'Content-Type': 'application/json' // Ensure content type is set
	},
	defaultProviderConfig: {
		// Default OpenRouter provider configuration
		require_parameters: true, // Only use providers that support all parameters
		sort: 'latency' as const, // Prioritize lowest latency for better performance
		data_collection: 'deny' as const // Don't allow data collection - use 'as const' to ensure correct type
	}
};

/**
 * Formats model name for OpenRouter API if needed
 * For OpenRouter, we need to use their model mapping format if it's not already in the correct format
 */
export function formatModelNameForOpenRouter(model: string): string {
	return model.includes('/') ? model : `openai/${model}`;
}

/**
 * Prepares request parameters for OpenRouter, handling special requirements
 *
 * This function applies multiple strategies to prevent streaming responses:
 * 1. Sets stream: false in multiple places
 * 2. Adds headers to signal no streaming
 * 3. Configures route_args with explicit stream: false
 *
 * @link ../src/lib/utils/openaiApi.ts - Schema-specific handling is done in callOpenAIWithSchema
 */
export function prepareOpenRouterRequest(
	requestConfig: ChatCompletionCreateParams
): ChatCompletionCreateParams {
	// Create a copy to avoid modifying the original
	const openRouterConfig: ChatCompletionCreateParams = {
		...requestConfig,
		// IMPORTANT: Force stream to false to prevent streaming responses
		stream: false,
		// Ensure response_format is set to force JSON output
		response_format: { type: 'json_object' }
	};

	// For OpenRouter, we'll simplify and focus on getting proper JSON rather than forcing tool calling
	// Remove tool_choice and tools for better compatibility
	if (openRouterConfig.tool_choice) {
		delete openRouterConfig.tool_choice;
	}

	// Functions are deprecated anyway, so remove those too
	if (openRouterConfig.function_call) {
		delete openRouterConfig.function_call;
	}

	// Extract schema from tools if present - but don't modify messages here,
	// schema injection is handled consistently in callOpenAIWithSchema
	if (openRouterConfig.tools && openRouterConfig.tools.length > 0) {
		// Remove tools from the request to prevent confusion
		delete openRouterConfig.tools;
	} else if (openRouterConfig.functions && openRouterConfig.functions.length > 0) {
		// Remove functions from the request to prevent confusion
		delete openRouterConfig.functions;
	}

	// Add provider configuration separately since it's not part of the official OpenAI API params
	const extendedConfig = openRouterConfig as Record<string, unknown>;

	// Add OpenRouter-specific configuration - ONLY using supported parameters
	extendedConfig.provider = {
		...OpenRouterProvider.defaultProviderConfig
	};

	// Add additional no-stream signals that OpenRouter might respect
	extendedConfig.http_options = {
		headers: {
			'x-no-stream': 'true',
			'x-api-control': 'sync-only',
			'content-type': 'application/json'
		}
	};

	extendedConfig.route_args = {
		stream: false,
		no_stream: true
	};

	extendedConfig.no_stream = true;
	extendedConfig.timeout = 120000; // 2-minute timeout

	// Add a user identifier to help with tracking and debugging
	extendedConfig.user = 'berkeley';

	return openRouterConfig;
}

/**
 * Process OpenRouter API response to ensure compatibility with OpenAI format
 * Addresses various inconsistencies and edge cases in OpenRouter responses
 */
export function processOpenRouterResponse(response: ChatCompletion): ChatCompletion {
	// If OpenRouter returns an empty choices array, create a compatible structure
	if (!response.choices || response.choices.length === 0) {
		console.log('[LLM Debug] Transforming empty OpenRouter response to OpenAI-compatible format');

		// Create synthetic OpenAI-compatible response with proper types
		return {
			...response,
			choices: [
				{
					index: 0,
					message: {
						role: 'assistant',
						content:
							'Sorry, I could not process your request through OpenRouter. Please try again or use a different provider.'
					},
					finish_reason: 'stop',
					logprobs: null
				}
			]
		};
	}

	// Ensure that if tool_calls are present, finish_reason is set correctly
	const firstChoice = response.choices[0];
	if (
		firstChoice &&
		firstChoice.message &&
		firstChoice.message.tool_calls &&
		firstChoice.message.tool_calls.length > 0
	) {
		if (firstChoice.finish_reason !== 'tool_calls') {
			console.log('[LLM Debug] Fixing OpenRouter response: setting finish_reason to tool_calls');
			firstChoice.finish_reason = 'tool_calls';
		}
	}

	return response;
}

/**
 * Type definitions for OpenRouter extensions to the OpenAI API
 * Based on OpenRouter documentation: https://openrouter.ai/docs
 *
 * NOTE: Always use direct type imports:
 * import type { ChatCompletionCreateParams } from 'openai';
 * NOT namespace notation (OpenAI.ChatCompletion)
 *
 * @module OpenRouter
 */

import type { ChatCompletionCreateParams, ChatCompletion, ClientOptions } from 'openai';

// === OpenRouter Provider Types ===

/**
 * Configuration options for the OpenRouter provider
 * Controls routing behavior, provider selection, and fallback options
 */
export interface OpenRouterProviderConfig {
	require_parameters?: boolean;
	sort?: 'price' | 'latency' | 'throughput';
	order?: string[];
	allow_fallbacks?: boolean;
	data_collection?: 'allow' | 'deny';
	ignore?: string[];
	route?: 'fallback';
	/**
	 * NOTE: disable_streaming is NOT supported by OpenRouter API
	 * Use 'stream: false' in the request body instead
	 */
}

/**
 * Configuration for the OpenRouter client connection
 */
export interface OpenRouterClientConfig {
	name: string;
	baseUrl: string;
	apiKeyEnvVar: string;
	headers?: Record<string, string>;
	defaultProviderConfig?: OpenRouterProviderConfig;
}

// === Extending OpenAI Types ===

/**
 * Extensions to OpenAI chat completion request parameters
 */
export interface OpenRouterChatCompletionParams {
	/**
	 * Array of model IDs to try as fallbacks if the primary model fails
	 * OpenRouter will try these models in order if the primary model returns an error
	 */
	models?: string[];

	/**
	 * OpenRouter-specific provider configuration
	 */
	provider?: OpenRouterProviderConfig;

	/**
	 * Arguments passed directly to the model provider's API route
	 */
	route_args?: OpenRouterRouteArgs;
}

/**
 * OpenRouter-specific metadata in response
 */
export interface OpenRouterResponseMetadata {
	/**
	 * The specific provider used for this completion
	 */
	provider?: string;

	/**
	 * Any transformations applied to the request
	 */
	transformations?: string[];
}

/**
 * Extended chat completion with OpenRouter metadata
 */
export interface OpenRouterChatCompletion extends OpenAI.ChatCompletion {
	openrouter?: OpenRouterResponseMetadata;
}

/**
 * OpenRouter-specific headers
 */
export interface OpenRouterHeaders {
	/**
	 * Your site URL for rankings on openrouter.ai
	 */
	'HTTP-Referer'?: string;

	/**
	 * Your site name for rankings on openrouter.ai
	 */
	'X-Title'?: string;

	/**
	 * Signal to disable streaming responses
	 */
	'X-No-Stream'?: string;

	/**
	 * Request synchronous-only processing
	 */
	'X-API-Control'?: string;
}

/**
 * Arguments passed directly to the model provider's API route
 */
export interface OpenRouterRouteArgs {
	/**
	 * Disable streaming at the route level
	 */
	stream?: boolean;

	/**
	 * Any other route-specific arguments
	 * Note: disable_streaming is NOT supported by OpenRouter API
	 */
	[key: string]: unknown;
}

// Module augmentation for OpenAI types
declare module 'openai' {
	// Add OpenRouter-specific fields to ChatCompletionCreateParams
	export interface ChatCompletionCreateParams {
		// Array of model IDs to try as fallbacks
		models?: string[];

		// OpenRouter-specific provider configuration
		provider?: OpenRouterProviderConfig;
	}

	// Add OpenRouter-specific fields to ChatCompletion response
	export interface ChatCompletion {
		// OpenRouter metadata in response
		openrouter?: {
			provider?: string;
			transformations?: string[];
		};
	}

	// Add OpenRouter headers to client options
	export interface ClientOptions {
		defaultHeaders?: Record<string, string> & {
			'HTTP-Referer'?: string; // Site URL for rankings
			'X-Title'?: string; // Site name for rankings
		};
	}
}

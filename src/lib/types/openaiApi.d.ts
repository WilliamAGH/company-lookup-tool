/**
 * Type definitions for OpenAI API v4 SDK
 * Based on OpenAI v4.86.1
 *
 * NOTE: Always use direct type imports:
 * import type { ChatCompletionMessageParam } from 'openai';
 * NOT namespace notation (OpenAI.ChatCompletionMessageParam)
 *
 * @module openai
 */

/**
 * Interface for OpenAI error details
 * Represents the detailed error information returned by OpenAI API
 */
export interface OpenAIErrorDetails {
	message?: string;
	type?: string;
	param?: string | null;
	code?: string;
}

/**
 * Enhanced error type for OpenAI API errors
 * Combines standard Error with OpenAI-specific error properties
 */
export type OpenAIError = Error & {
	code?: string;
	status?: number;
	error?: OpenAIErrorDetails;
	response?: {
		status: number;
		headers: Record<string, string>;
		data: Record<string, unknown>;
	};
};

/**
 * Completion usage info from OpenAI response
 */
export interface CompletionUsage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

/**
 * Extended usage info with cost calculation
 */
export interface ExtendedUsage extends CompletionUsage {
	costUSD: number;
}

/**
 * Cost information for API calls
 * Used for tracking token usage and cost
 */
export interface ApiCost {
	totalTokens: number;
	costUSD: number;
}

/**
 * Standard API response format for API endpoints
 * Used as a consistent envelope for all API responses
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	_meta?: {
		cost?: ApiCost;
		[key: string]: unknown;
	};
}

/**
 * OpenRouter-specific provider configuration
 * Imported from data-tools/providers/openrouter.ts
 */
export interface OpenRouterProviderConfig {
	require_parameters?: boolean;
	sort?: 'price' | 'latency' | 'throughput';
	order?: string[];
	allow_fallbacks?: boolean;
	data_collection?: 'allow' | 'deny';
	ignore?: string[];
	// Note: disable_streaming is NOT supported by OpenRouter
	// Use stream: false in the main request instead
}

/**
 * Configuration for supported LLM providers
 */
export interface LLMProviderConfig {
	name: string;
	baseUrl: string;
	apiKeyEnvVar: string;
	headers?: Record<string, string>;
	defaultProviderConfig?: OpenRouterProviderConfig;
}

/**
 * Configuration for LLM models
 */
export interface ModelConfig {
	max_tokens: number;
	max_input_tokens: number;
	max_output_tokens: number;
	input_cost_per_token: number;
	output_cost_per_token: number;
	litellm_provider?: string;
	mode?: string;
	supports_function_calling?: boolean;
	supports_parallel_function_calling?: boolean;
	supports_vision?: boolean;
	supports_prompt_caching?: boolean;
	supports_system_messages?: boolean;
	supports_tool_choice?: boolean;
	[key: string]: unknown;
}

/**
 * Collection of LLM model configurations
 */
export interface LLMModels {
	[modelName: string]: ModelConfig;
}

declare module 'openai' {
	export interface ClientOptions {
		apiKey: string;
		baseURL?: string;
		defaultHeaders?: Record<string, string>;
		defaultQuery?: Record<string, string>;
		timeout?: number;
		maxRetries?: number;
		[key: string]: unknown;
	}

	// Message types
	export interface ChatCompletionMessageParam {
		role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
		content: string | null;
		name?: string;
		/** @deprecated Use tool_calls instead. This field is deprecated as of API version 2023-12-01-preview. */
		function_call?: { name: string; arguments: string };
		tool_calls?: Array<{
			id: string;
			type: 'function';
			function: { name: string; arguments: string };
		}>;
		tool_call_id?: string;
	}

	// Request parameters
	export interface ChatCompletionCreateParams {
		model: string;
		messages: ChatCompletionMessageParam[];
		/** @deprecated Use tools instead. This parameter is deprecated as of API version 2023-12-01-preview. */
		functions?: Array<{
			name: string;
			description?: string;
			parameters: Record<string, unknown>;
		}>;
		/** @deprecated Use tool_choice instead. This parameter is deprecated as of API version 2023-12-01-preview. */
		function_call?: 'auto' | 'none' | { name: string };
		temperature?: number;
		top_p?: number;
		max_tokens?: number;
		frequency_penalty?: number;
		presence_penalty?: number;
		stop?: string | string[];
		response_format?: { type: string };
		stream?: boolean;
		tools?: Array<{
			type: 'function';
			function: {
				name: string;
				description?: string;
				parameters: Record<string, unknown>;
			};
		}>;
		tool_choice?: 'auto' | 'none' | { function: { name: string } };
		user?: string;
		[key: string]: unknown;
	}

	// Response types
	export interface ChatCompletion {
		id: string;
		object: 'chat.completion';
		created: number;
		model: string;
		choices: Array<{
			index: number;
			message: {
				role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
				content: string | null;
				function_call?: { name: string; arguments: string };
				tool_calls?: Array<{
					id: string;
					type: 'function';
					function: { name: string; arguments: string };
				}>;
			};
			finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'tool_calls';
			logprobs?: unknown;
		}>;
		usage: {
			prompt_tokens: number;
			completion_tokens: number;
			total_tokens: number;
		};
		system_fingerprint?: string;
	}

	// Class definition
	export default class OpenAI {
		constructor(options: ClientOptions);

		chat: {
			completions: {
				create(params: ChatCompletionCreateParams): Promise<ChatCompletion>;
			};
		};
	}
}

/**
 * OpenAI API schema definitions
 *
 * Contains validation schema for OpenAI API requests and responses.
 *
 * @module
 * @see {@link ../base/common.schema.ts}
 */

import { z } from 'zod';
import { nonEmptyStringSchema } from '../base/common.schema';

/**
 * OpenAI chat message role enum
 */
export const openAiRoleEnum = z.enum(['system', 'user', 'assistant', 'function']);

/**
 * OpenAI chat message role type derived from schema
 */
export type OpenAiRole = z.infer<typeof openAiRoleEnum>;

/**
 * OpenAI chat message schema
 *
 * @example
 * const result = openAiMessageSchema.safeParse({
 *   role: 'user',
 *   content: 'Tell me about Acme Corp'
 * });
 */
export const openAiMessageSchema = z.object({
	role: openAiRoleEnum,
	content: nonEmptyStringSchema,
	name: z.string().optional(),
	function_call: z.record(z.any()).optional()
});

/**
 * OpenAI chat message type derived from schema
 */
export type OpenAiMessage = z.infer<typeof openAiMessageSchema>;

/**
 * OpenAI chat completion request schema
 *
 * @example
 * const result = openAiCompletionRequestSchema.safeParse({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant.' },
 *     { role: 'user', content: 'Tell me about Acme Corp' }
 *   ],
 *   temperature: 0.7
 * });
 */
export const openAiCompletionRequestSchema = z.object({
	model: nonEmptyStringSchema,
	messages: z.array(openAiMessageSchema),
	temperature: z.number().min(0).max(2).optional().default(0.7),
	max_tokens: z.number().int().positive().optional(),
	stream: z.boolean().optional().default(false),
	functions: z.array(z.any()).optional(),
	function_call: z.union([z.string(), z.record(z.any())]).optional()
});

/**
 * OpenAI chat completion request type derived from schema
 */
export type OpenAiCompletionRequest = z.infer<typeof openAiCompletionRequestSchema>;

/**
 * OpenAI chat completion response schema
 *
 * Simplified schema for the response from OpenAI's chat completion API
 */
export const openAiCompletionResponseSchema = z.object({
	id: nonEmptyStringSchema,
	object: z.literal('chat.completion'),
	created: z.number(),
	model: nonEmptyStringSchema,
	choices: z.array(
		z.object({
			index: z.number(),
			message: openAiMessageSchema,
			finish_reason: z.string()
		})
	),
	usage: z.object({
		prompt_tokens: z.number(),
		completion_tokens: z.number(),
		total_tokens: z.number()
	})
});

/**
 * OpenAI chat completion response type derived from schema
 */
export type OpenAiCompletionResponse = z.infer<typeof openAiCompletionResponseSchema>;

/**
 * Common schema definitions
 *
 * Contains reusable validation schema for common data patterns
 * used throughout the application.
 *
 * @module
 */

import { z } from 'zod';

/**
 * URL validation schema
 *
 * @example
 * const result = urlSchema.safeParse('https://example.com');
 */
export const urlSchema = z.string().url();

/**
 * Optional URL validation schema
 *
 * @example
 * const result = optionalUrlSchema.safeParse(undefined);
 */
export const optionalUrlSchema = urlSchema.optional();

/**
 * Email validation schema
 *
 * @example
 * const result = emailSchema.safeParse('user@example.com');
 */
export const emailSchema = z.string().email();

/**
 * Non-empty string validation schema
 *
 * @example
 * const result = nonEmptyStringSchema.safeParse('Hello');
 */
export const nonEmptyStringSchema = z.string().min(1);

/**
 * Confidence level enum for data quality assessment
 */
export const confidenceLevelEnum = z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);

/**
 * Confidence level type derived from schema
 */
export type ConfidenceLevel = z.infer<typeof confidenceLevelEnum>;

/**
 * Pagination parameters schema
 *
 * @example
 * const result = paginationParamsSchema.safeParse({ page: 1, limit: 10 });
 */
export const paginationParamsSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20)
});

/**
 * Pagination parameters type derived from schema
 */
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Percentage schema
 * Validates that a number is between 0 and 100
 */
export const percentageSchema = z.number().min(0).max(100);
export type Percentage = z.infer<typeof percentageSchema>;

/**
 * Currency amount schema (in cents)
 * Validates that a number is a valid currency amount in cents
 */
export const currencyAmountSchema = z.number().int();
export type CurrencyAmount = z.infer<typeof currencyAmountSchema>;

/**
 * Phone number schema
 * Basic validation for phone numbers
 * Note: For more complex validation, consider using a dedicated library
 */
export const phoneNumberSchema = z.string().regex(/^\+?[0-9]{10,15}$/);
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

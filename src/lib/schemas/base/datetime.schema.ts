/**
 * Base datetime schema definitions
 *
 * Contains reusable date and time validation schema that serve as building blocks
 * for domain-specific schema throughout the application.
 *
 * @module
 */

import { z } from 'zod';

/**
 * ISO date string validation schema
 *
 * @example
 * const result = isoDateSchema.safeParse('2023-04-15T14:32:17Z');
 */
export const isoDateSchema = z.string().datetime();

/**
 * Date object validation schema
 *
 * @example
 * const result = dateObjectSchema.safeParse(new Date());
 */
export const dateObjectSchema = z.date();

/**
 * Year validation schema (for established dates, etc.)
 * Validates years between 1900 and current year + 1
 *
 * @example
 * const result = yearSchema.safeParse(2023);
 */
export const yearSchema = z
	.number()
	.int()
	.min(1900)
	.max(new Date().getFullYear() + 1);

/**
 * Optional year validation schema
 *
 * @example
 * const result = optionalYearSchema.safeParse(undefined);
 */
export const optionalYearSchema = yearSchema.optional();

/**
 * ISO date string type derived from schema
 */
export type ISODateString = z.infer<typeof isoDateSchema>;

/**
 * Year type derived from schema
 */
export type Year = z.infer<typeof yearSchema>;

/**
 * Optional date schema
 * Used for fields that may be undefined
 */
export const optionalDateSchema = dateObjectSchema.optional();
export type OptionalDate = z.infer<typeof optionalDateSchema>;

/**
 * Nullable date schema
 * Used for fields that may be null
 */
export const nullableDateSchema = dateObjectSchema.nullable();
export type NullableDate = z.infer<typeof nullableDateSchema>;

/**
 * Timestamp schema (Unix timestamp in milliseconds)
 * Validates that a number is a valid timestamp
 */
export const timestampSchema = z.number().int().positive();
export type Timestamp = z.infer<typeof timestampSchema>;

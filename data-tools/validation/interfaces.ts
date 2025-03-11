/**
 * interfaces.ts
 * Core interfaces for the validation system
 *
 * This module provides the foundational interfaces for the validation system
 * including ValidationResult, ValidationError, Validator, and RepairStrategy.
 *
 * This file follows DRY principles by importing all schema-related types from
 * the central schema index rather than defining redundant type aliases.
 *
 * @link src/lib/server/db/research/schema/index.ts - Source of schema types
 * @link data-tools/sharedUtils/dataProcessing.ts - Validation and repair implementation
 * @link validators/ - Contains implementations of these interfaces
 * @link repair/ - Contains repair strategy implementations
 */

/**
 * ValidationError represents a specific validation error with details
 * about the error location and severity
 */
export interface ValidationError {
	code: string; // Error code for categorization
	message: string; // Human-readable error message
	path: string; // JSON path to the error location
	severity: ErrorSeverity; // Error severity level
	metadata?: Record<string, unknown>; // Optional additional context
}

/**
 * Error severity level - used to prioritize errors
 */
export type ErrorSeverity = 'error' | 'warning';

/**
 * Standard validation result interface
 */
export interface ValidationResult {
	isValid: boolean; // Whether the data is valid
	errors: ValidationError[]; // List of validation errors if any
}

/**
 * Validator interface for all validation strategies
 */
export interface Validator<T> {
	validate(data: T): ValidationResult;
}

/**
 * Repair strategy interface for automatic fixes
 */
export interface RepairStrategy<T> {
	canRepair(data: T, errors: ValidationError[]): boolean;
	repair(data: T, errors: ValidationError[]): T;
}

/**
 * Result of applying repair strategies
 */
export interface RepairResult<T> {
	repaired: T; // The repaired data
	success: boolean; // Whether the repair was successful
	appliedStrategies: string[]; // Names of strategies that were applied
	remainingErrors: ValidationError[]; // Errors that couldn't be fixed
}

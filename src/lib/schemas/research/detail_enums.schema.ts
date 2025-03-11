/**
 * Entity detail enum Zod schemas - SOURCE OF TRUTH
 *
 * This file contains the canonical Zod schemas for entity detail enum types,
 * data confidence levels, and source types used throughout the application.
 *
 * IMPORTANT: This file is the SOURCE OF TRUTH for all entity detail enums. Types are
 * derived from these schemas to ensure consistency across client and server.
 *
 * @link src/lib/server/db/research/schema/entity_detail_enums.ts - Server-side database schema
 */

import { z } from 'zod';

// Confidence levels for data quality assessment
export const dataConfidence = [
	'verified', // Highest level - multiple authoritative sources
	'high', // Strong confidence - reliable single source
	'medium', // Moderate confidence - partial information
	'low', // Low confidence - limited information
	'speculative' // Lowest - educated guesses
] as const;

// Convert to Zod enum
export const dataConfidenceEnum = z.enum(dataConfidence);
export type DataConfidence = z.infer<typeof dataConfidenceEnum>;

// Research detail types categorized by domain
export const researchDetailTypes = [
	// Market share metrics
	'market_share_min',
	'market_share_max',
	'market_share_exact',
	'market_share_estimate',

	// Employee metrics
	'employee_count_exact',
	'employee_count_estimate',
	'employee_count_min',
	'employee_count_max',

	// Customer metrics
	'churn_rate_estimate',
	'customer_count_estimate',
	'active_users_estimate',
	'arpu_estimate', // Average Revenue Per User
	'cac_estimate', // Customer Acquisition Cost
	'ltv_estimate', // Lifetime Value
	'runway_months_estimate',

	// Market metrics
	'market_size_usd',
	'market_growth_rate'
] as const;

// Convert to Zod enum
export const typeResearchDetailEnum = z.enum(researchDetailTypes);
export type TypeResearchDetail = z.infer<typeof typeResearchDetailEnum>;

// Source types for data origin tracking
export const sourceTypes = [
	'industry_report',
	'company_filing',
	'news_article',
	'analyst_estimate',
	'company_website',
	'press_release',
	'unknown'
] as const;

// Convert to Zod enum
export const sourceTypeEnum = z.enum(sourceTypes);
export type SourceType = z.infer<typeof sourceTypeEnum>;

/**
 * Extended source types for API schema organized by category.
 * These provide more detailed source types than the database enum
 * but will be mapped to the database enum values when transforming responses.
 */
export const extendedSourceTypes = {
	financial: [
		'sec_filing',
		'annual_report',
		'quarterly_report',
		'earnings_call',
		'press_release',
		'investor_presentation'
	],
	marketShare: [
		'industry_report',
		'market_research',
		'analyst_estimate',
		'news_article',
		'academic_paper',
		'government_data'
	],
	general: ['company_statement', 'executive_interview', 'unknown']
} as const;

// Combine all extended source types
export const allExtendedSourceTypes = [
	...extendedSourceTypes.financial,
	...extendedSourceTypes.marketShare,
	...extendedSourceTypes.general
] as const;

// Convert to Zod enum
export const extendedSourceTypeEnum = z.enum(allExtendedSourceTypes);
export type ExtendedSourceType = z.infer<typeof extendedSourceTypeEnum>;

// Derived extended source type lists (useful for schema validation)
export const financialSourceTypes = [
	...extendedSourceTypes.financial,
	...extendedSourceTypes.general
] as const;

export const marketShareSourceTypes = [
	...extendedSourceTypes.marketShare,
	...extendedSourceTypes.general
] as const;

// Create Zod enums for these specialized lists
export const financialSourceTypeEnum = z.enum(financialSourceTypes);
export const marketShareSourceTypeEnum = z.enum(marketShareSourceTypes);

/**
 * Primary source types are refinements of the sourceTypes enum,
 * providing specific categorization for data quality assessment.
 */
export const primarySourceTypes = [
	'sec_filing',
	'industry_report',
	'news_article',
	'company_statement',
	'analyst_estimate',
	'unknown'
] as const;

// Convert to Zod enum
export const primarySourceTypeEnum = z.enum(primarySourceTypes);
export type PrimarySourceType = z.infer<typeof primarySourceTypeEnum>;

/**
 * Period types for financial data reporting periods
 * These are the period components used in the source column after the source type prefix.
 *
 * Format in source column: "source_type: period-identifier"
 * Examples:
 * - "sec_filing: annual-2023"
 * - "analyst_estimate: quarterly-2024-Q1"
 * - "industry_report: ttm-2024-Q1"
 */
export const periodTypes = ['annual', 'quarterly', 'monthly', 'ttm', 'custom'] as const;

// Convert to Zod enum
export const periodTypeEnum = z.enum(periodTypes);
export type PeriodType = z.infer<typeof periodTypeEnum>;

// Metric type categories for organizing metrics
export const metricTypes = [
	'market_share',
	'market_size',
	'growth_rate',
	'employee_count',
	'revenue',
	'valuation',
	'customer_metrics',
	'financial_metrics'
] as const;

// Convert to Zod enum
export const metricTypeEnum = z.enum(metricTypes);
export type MetricType = z.infer<typeof metricTypeEnum>;

/**
 * Mapping between high-level MetricType and detailed TypeResearchDetail values.
 * Used for filtering and organizing metrics in analysis.
 */
export const metricTypeToDetailMap: Record<MetricType, TypeResearchDetail[]> = {
	market_share: [
		'market_share_min',
		'market_share_max',
		'market_share_exact',
		'market_share_estimate'
	],
	market_size: ['market_size_usd'],
	growth_rate: ['market_growth_rate'],
	employee_count: [
		'employee_count_exact',
		'employee_count_estimate',
		'employee_count_min',
		'employee_count_max'
	],
	revenue: [],
	valuation: [],
	customer_metrics: [
		'churn_rate_estimate',
		'customer_count_estimate',
		'active_users_estimate',
		'arpu_estimate',
		'ltv_estimate'
	],
	financial_metrics: ['cac_estimate', 'runway_months_estimate']
};

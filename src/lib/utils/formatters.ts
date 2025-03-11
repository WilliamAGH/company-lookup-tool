/**
 * Utility functions for formatting values in the UI
 */

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
	value: number,
	currency: string = 'USD',
	locale: string = 'en-US'
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		maximumFractionDigits: 2,
		notation: value >= 1000000 ? 'compact' : 'standard'
	}).format(value);
}

/**
 * Format a number as a percentage
 * @param value - The number to format (0.1 = 10%)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, locale: string = 'en-US'): string {
	return new Intl.NumberFormat(locale, {
		style: 'percent',
		maximumFractionDigits: 2
	}).format(value);
}

/**
 * Format a date
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(dateObj);
}

/**
 * Format a number with commas
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
	return new Intl.NumberFormat(locale).format(value);
}

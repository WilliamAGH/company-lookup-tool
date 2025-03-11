/**
 * TypeScript type definitions for the company detail page
 */

/**
 * Base company data from the API
 */
export interface CompanyData {
	id: string;
	slug: string;
	name: string;
	nameLegal?: string;
	description?: string;
	logoUrl?: string;
	faviconUrl?: string;
	websiteUrl?: string;
	foundedYear?: number;
	employeeCount?: number;
	headquarters?: {
		city?: string;
		state?: string;
		country?: string;
	};
	industry?: string;
	sector?: string;
	relatedUrls?: RelatedUrl[];
	types?: CompanyTypes;
}

/**
 * Company type information
 */
export interface CompanyTypeInfo {
	id: string | number;
	name: string;
	slug: string;
	isPrimary: boolean;
}

/**
 * Grouped company types by category
 */
export interface CompanyTypes {
	[category: string]: CompanyTypeInfo[];
}

/**
 * Related URL data
 */
export interface RelatedUrl {
	type: string;
	url: string;
	title?: string;
}

/**
 * Market position data
 */
export interface MarketPosition {
	marketCap: string;
	marketCapValue: number;
	valueToSales: number;
	valueToSalesVsSector: string;
	growthRate: number;
	growthRateVsSector: string;
	profitMargin: number;
	profitMarginVsSector: string;
	sectorComparison: {
		sector: number;
		nasdaq: number;
		sp500: number;
	};
}

/**
 * Classification data
 */
export interface Classification {
	businessModel: string[];
	revenueTypes: string[];
	technologyStack: string[];
	industries: string[];
}

/**
 * Leadership data
 */
export interface Leadership {
	executives: Executive[];
	board: BoardMember[];
}

export interface Executive {
	name: string;
	title: string;
	photoUrl?: string;
	previousExperience?: string;
	joinedYear?: number;
}

export interface BoardMember {
	name: string;
	title: string;
	organization?: string;
	joinedYear?: number;
}

/**
 * Global presence data
 */
export interface GlobalPresence {
	headquarters: Office;
	majorOffices: Office[];
	operatingCountries: number;
	totalOffices: number;
}

export interface Office {
	city: string;
	state?: string;
	country: string;
	employeeCount?: number;
}

/**
 * Financial metrics data
 */
export interface FinancialMetrics {
	marketCap?: number;
	revenue?: number;
	profitMargin?: number;
	yoyGrowth?: number;
	revenueByRegion?: {
		region: string;
		percentage: number;
	}[];
	keyRatios?: {
		name: string;
		value: number;
	}[];
	financialStatements?: {
		years: string[];
		revenue: number[];
		grossProfit: number[];
		operatingIncome: number[];
		netIncome: number[];
	};
}

/**
 * Products data
 */
export interface Products {
	productLines: ProductLine[];
	competitors: Competitor[];
}

export interface ProductLine {
	name: string;
	revenuePercentage: number;
	growth: string;
	description: string;
}

export interface Competitor {
	name: string;
	marketShare: number;
	primaryCompetition: string;
}

/**
 * SWOT analysis data
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

export interface SwotItem {
	text: string;
	impact: ImpactLevel;
}

export interface SwotAnalysis {
	strengths: SwotItem[];
	weaknesses: SwotItem[];
	opportunities: SwotItem[];
	threats: SwotItem[];
}

/**
 * Porter's Five Forces data
 */
export interface PortersFiveForces {
	competitiveRivalry: number;
	supplierPower: number;
	buyerPower: number;
	threatOfSubstitutes: number;
	threatOfNewEntrants: number;
}

/**
 * Future scenarios data
 */
export interface FutureScenario {
	title: string;
	probability: number;
	description: string;
	impact: ImpactLevel;
}

/**
 * News data
 */
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface NewsItem {
	headline: string;
	source: string;
	date: string;
	url: string;
	sentiment: SentimentType;
	analysis: string;
}

export interface SignificantEvent {
	title: string;
	date: string;
	description: string;
}

export interface NewsData {
	recentNews: NewsItem[];
	significantEvents: SignificantEvent[];
}

/**
 * FAQ data
 */
export interface FaqItem {
	question: string;
	answer: string;
}

export interface FaqCategory {
	name: string;
	questions: FaqItem[];
}

/**
 * Enhanced company data with all mock data
 */
export interface EnhancedCompanyData extends CompanyData {
	marketPosition: MarketPosition;
	classification: Classification;
	leadership: Leadership;
	globalPresence: GlobalPresence;
	financialMetrics: FinancialMetrics;
	products: Products;
	analysis: {
		swot: SwotAnalysis;
		portersFiveForces: PortersFiveForces;
		futureScenarios: FutureScenario[];
	};
	news: NewsData;
	faq: FaqCategory[];
}

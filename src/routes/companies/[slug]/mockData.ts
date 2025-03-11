/**
 * Mock Data Generators for Company Detail Page
 *
 * This file contains functions to generate realistic mock data for the company detail page
 * when the API doesn't yet provide all the necessary data.
 *
 * These generators will be replaced with real API data as it becomes available.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { CompanyData } from './types';

/**
 * Generates mock market position data
 */
export function mockMarketPositionData(_company: CompanyData) {
	// Use company name to generate consistent mock data
	// const seed = company.name || company.nameLegal || '';

	return {
		marketCap: '$144.2B',
		marketCapValue: 144200000000,
		valueToSales: 8.0,
		valueToSalesVsSector: '+33%',
		growthRate: 26,
		growthRateVsSector: '+12%',
		profitMargin: 12,
		profitMarginVsSector: '-3%',
		sectorComparison: {
			sector: 6.0,
			nasdaq: 5.0,
			sp500: 2.0
		}
	};
}

/**
 * Generates mock classification data
 */
export function mockClassificationData(_company: CompanyData) {
	return {
		businessModel: ['Platform', 'Marketplace', 'On-Demand'],
		revenueTypes: ['Transaction Fees', 'Subscription', 'Advertising'],
		technologyStack: [
			'Mobile Apps',
			'Cloud Infrastructure',
			'Machine Learning',
			'Mapping Technology'
		],
		industries: ['Transportation', 'Logistics', 'Food Delivery']
	};
}

/**
 * Generates mock leadership data
 */
export function mockLeadershipData(_company: CompanyData) {
	return {
		executives: [
			{
				name: 'Dara Khosrowshahi',
				title: 'Chief Executive Officer',
				photoUrl: 'https://example.com/dara.jpg',
				previousExperience: 'Expedia, IAC',
				joinedYear: 2017
			},
			{
				name: 'Nelson Chai',
				title: 'Chief Financial Officer',
				photoUrl: 'https://example.com/nelson.jpg',
				previousExperience: 'CIT Group, Merrill Lynch',
				joinedYear: 2018
			},
			{
				name: 'Jill Hazelbaker',
				title: 'SVP, Marketing & Public Affairs',
				photoUrl: 'https://example.com/jill.jpg',
				previousExperience: 'Google, Snapchat',
				joinedYear: 2015
			}
		],
		board: [
			{
				name: 'Ronald Sugar',
				title: 'Chairperson',
				organization: 'Former Northrop Grumman CEO',
				joinedYear: 2018
			},
			{
				name: 'Ursula Burns',
				title: 'Board Member',
				organization: 'Former Xerox CEO',
				joinedYear: 2017
			}
		]
	};
}

/**
 * Generates mock global presence data
 */
export function mockGlobalPresenceData(_company: CompanyData) {
	return {
		headquarters: {
			city: 'San Francisco',
			state: 'California',
			country: 'United States',
			employeeCount: 4000
		},
		majorOffices: [
			{
				city: 'New York',
				country: 'United States',
				employeeCount: 2500
			},
			{
				city: 'London',
				country: 'United Kingdom',
				employeeCount: 1800
			},
			{
				city: 'Singapore',
				country: 'Singapore',
				employeeCount: 1200
			}
		],
		operatingCountries: 72,
		totalOffices: 24
	};
}

/**
 * Generates mock financial metrics data
 */
export function mockFinancialMetricsData(_company: CompanyData) {
	return {
		revenue: {
			current: '$34.3B',
			value: 34300000000,
			growth: '+17.8%',
			history: [28.2, 30.5, 32.1, 34.3] // In billions
		},
		profitMargin: {
			current: '12%',
			value: 12,
			growth: '+2.5%',
			history: [8.5, 9.2, 10.8, 12.0] // Percentages
		},
		operatingIncome: {
			current: '$5.1B',
			value: 5100000000,
			growth: '+22.3%',
			history: [3.2, 3.8, 4.2, 5.1] // In billions
		},
		cashFlow: {
			current: '$8.2B',
			value: 8200000000,
			growth: '+15.7%',
			history: [6.1, 6.8, 7.5, 8.2] // In billions
		},
		geographicRevenue: {
			northAmerica: 58,
			europe: 22,
			asiaPacific: 15,
			latinAmerica: 5
		}
	};
}

/**
 * Generates mock products data
 */
export function mockProductsData(_company: CompanyData) {
	return {
		productLines: [
			{
				name: 'Rideshare',
				revenuePercentage: 60,
				growth: '+12%',
				description: 'On-demand transportation service connecting riders with drivers'
			},
			{
				name: 'Delivery',
				revenuePercentage: 30,
				growth: '+28%',
				description: 'Food and package delivery service'
			},
			{
				name: 'Freight',
				revenuePercentage: 10,
				growth: '+15%',
				description: 'Logistics platform for shippers and carriers'
			}
		],
		competitors: [
			{
				name: 'Lyft',
				marketShare: 32,
				primaryCompetition: 'Rideshare'
			},
			{
				name: 'DoorDash',
				marketShare: 45,
				primaryCompetition: 'Delivery'
			},
			{
				name: 'Convoy',
				marketShare: 18,
				primaryCompetition: 'Freight'
			}
		]
	};
}

/**
 * Generates mock SWOT analysis data
 */
export function mockSwotAnalysisData(_company: CompanyData) {
	return {
		strengths: [
			{ text: 'Strong brand recognition globally', impact: 'high' },
			{ text: 'Diversified business model across transportation and delivery', impact: 'high' },
			{ text: 'Extensive driver network and user base', impact: 'high' }
		],
		weaknesses: [
			{ text: 'Regulatory challenges in key markets', impact: 'high' },
			{ text: 'Path to profitability concerns', impact: 'medium' },
			{ text: 'Driver classification issues', impact: 'high' }
		],
		opportunities: [
			{ text: 'Expansion into new markets and services', impact: 'high' },
			{ text: 'Autonomous vehicle integration', impact: 'medium' },
			{ text: 'Growth in delivery services beyond food', impact: 'medium' }
		],
		threats: [
			{ text: 'Increasing competition in core markets', impact: 'high' },
			{ text: 'Regulatory changes affecting business model', impact: 'high' },
			{ text: 'Rising driver acquisition costs', impact: 'medium' }
		]
	};
}

/**
 * Generates mock Porter's Five Forces data
 */
export function mockPortersFiveForces(_company: CompanyData) {
	return {
		competitiveRivalry: {
			score: 4.5, // 1-5 scale
			factors: [
				'High competition in rideshare market',
				'Price wars with competitors',
				'Low switching costs for customers'
			]
		},
		threatOfNewEntrants: {
			score: 3.2,
			factors: [
				'High capital requirements',
				'Network effects create barriers',
				'Brand recognition advantage'
			]
		},
		threatOfSubstitutes: {
			score: 3.8,
			factors: ['Public transportation alternatives', 'Traditional taxi services', 'Car ownership']
		},
		bargainingPowerOfBuyers: {
			score: 4.0,
			factors: ['Low switching costs', 'Price sensitivity', 'Multiple service options']
		},
		bargainingPowerOfSuppliers: {
			score: 2.5,
			factors: ['Large driver pool', 'Low driver switching costs', 'Vehicle supply constraints']
		}
	};
}

/**
 * Generates mock future scenarios data
 */
export function mockFutureScenarios(_company: CompanyData) {
	return {
		fiveYear: {
			baseCase: {
				revenue: '$52.8B',
				marketShare: '38%',
				profitMargin: '18%',
				keyDrivers: [
					'Continued growth in delivery segment',
					'Moderate expansion in international markets',
					'Incremental efficiency improvements'
				]
			},
			bullCase: {
				revenue: '$68.5B',
				marketShare: '45%',
				profitMargin: '22%',
				keyDrivers: [
					'Successful autonomous vehicle integration',
					'Rapid international expansion',
					'New service category launches'
				]
			},
			bearCase: {
				revenue: '$41.2B',
				marketShare: '32%',
				profitMargin: '10%',
				keyDrivers: [
					'Increased regulatory pressure',
					'Rising competition from well-funded rivals',
					'Driver supply constraints'
				]
			}
		},
		tenYear: {
			baseCase: {
				revenue: '$78.5B',
				marketShare: '35%',
				profitMargin: '20%',
				keyDrivers: [
					'Mature autonomous vehicle fleet',
					'Established global presence',
					'Diversified service offerings'
				]
			},
			bullCase: {
				revenue: '$120.3B',
				marketShare: '42%',
				profitMargin: '25%',
				keyDrivers: [
					'Market leader in autonomous transportation',
					'Successful vertical integration',
					'Expansion into adjacent markets'
				]
			},
			bearCase: {
				revenue: '$55.1B',
				marketShare: '28%',
				profitMargin: '12%',
				keyDrivers: [
					'Disruption from new technologies',
					'Regulatory constraints in key markets',
					'Margin pressure from competition'
				]
			}
		}
	};
}

/**
 * Generates mock news data
 */
export function mockNewsData(_company: CompanyData) {
	return {
		recentNews: [
			{
				headline: 'Uber Reports Strong Q2 Earnings, Beats Expectations',
				source: 'Financial Times',
				date: '2023-08-15',
				url: 'https://example.com/news1',
				sentiment: 'positive',
				analysis:
					"The earnings beat suggests Uber's strategy is working well, with particular strength in the delivery segment which grew 28% year-over-year."
			},
			{
				headline: 'Uber Expands Grocery Delivery Service to 5 New Countries',
				source: 'TechCrunch',
				date: '2023-07-22',
				url: 'https://example.com/news2',
				sentiment: 'positive',
				analysis:
					'This expansion represents a significant growth opportunity in the competitive delivery space, potentially adding a new revenue stream.'
			},
			{
				headline: "New Regulations in EU Could Impact Uber's Driver Classification",
				source: 'Reuters',
				date: '2023-06-30',
				url: 'https://example.com/news3',
				sentiment: 'negative',
				analysis:
					'These regulatory changes could increase operating costs in the European market, potentially affecting margins in the region.'
			},
			{
				headline: 'Uber Partners with Autonomous Vehicle Startup for Pilot Program',
				source: 'Bloomberg',
				date: '2023-06-12',
				url: 'https://example.com/news4',
				sentiment: 'neutral',
				analysis:
					'While promising for the long term, this partnership is still in early stages and unlikely to impact near-term financial performance.'
			}
		],
		significantEvents: [
			{
				title: 'IPO',
				date: '2019-05-10',
				description: 'Initial public offering at $45 per share'
			},
			{
				title: 'CEO Change',
				date: '2017-08-28',
				description: 'Dara Khosrowshahi appointed as CEO'
			},
			{
				title: 'Acquisition',
				date: '2020-07-06',
				description: 'Acquired Postmates for $2.65 billion'
			}
		]
	};
}

/**
 * Generates mock FAQ data
 */
export function mockFaqData(_company: CompanyData) {
	return {
		categories: [
			{
				name: 'Business Model',
				questions: [
					{
						question: 'How does Uber generate revenue?',
						answer:
							'Uber generates revenue primarily through service fees charged on rides and deliveries completed through its platform. The company takes a percentage of each transaction, typically between 20-25% of the total fare. Additional revenue streams include membership fees from Uber One, advertising, and enterprise solutions for businesses.'
					},
					{
						question: "What is Uber's market share in the ridesharing industry?",
						answer:
							'Uber holds approximately 68% of the U.S. ridesharing market as of 2023, making it the dominant player. Globally, market share varies by region, with strong positions in North America, parts of Europe, and select markets in Asia and Latin America.'
					}
				]
			},
			{
				name: 'Financial Performance',
				questions: [
					{
						question: 'Is Uber profitable?',
						answer:
							'After years of losses, Uber achieved profitability on an adjusted EBITDA basis in 2021. The company continues to work toward consistent GAAP profitability, with improving margins in recent quarters driven by operational efficiencies and growth in high-margin segments.'
					},
					{
						question: "What are Uber's fastest growing business segments?",
						answer:
							'Uber Eats (food delivery) and Uber Freight have been among the fastest-growing segments in recent years. The delivery business saw particularly strong growth during the COVID-19 pandemic and has maintained solid performance, while the freight segment is growing from a smaller base but at a rapid rate.'
					}
				]
			},
			{
				name: 'Strategy & Outlook',
				questions: [
					{
						question: "What is Uber's strategy for autonomous vehicles?",
						answer:
							'After selling its self-driving unit (Advanced Technologies Group) to Aurora in 2020, Uber has shifted to a partnership approach for autonomous vehicles. The company is forming strategic alliances with autonomous technology developers to eventually integrate self-driving vehicles into its network, rather than developing the technology in-house.'
					},
					{
						question: 'How is Uber addressing regulatory challenges?',
						answer:
							'Uber has adopted a more collaborative approach with regulators under CEO Dara Khosrowshahi, working to address concerns proactively and engage in policy discussions. The company has also invested in lobbying efforts and public campaigns to shape favorable legislation, particularly around driver classification issues.'
					}
				]
			}
		]
	};
}

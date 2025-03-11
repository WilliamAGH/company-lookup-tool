<!-- 
  Analysis.svelte
  
  This component renders the Analysis tab content for the company detail page.
  It includes SWOT analysis, competitive positioning, and industry trends.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	export let company: EnhancedCompanyData;

	// Placeholder SWOT data - in a real implementation, this would come from the company data
	const swotAnalysis = {
		strengths: [
			'Strong brand recognition and market presence',
			'Diversified product portfolio across multiple segments',
			'Robust R&D capabilities and innovation pipeline',
			'Strong financial position with healthy cash reserves',
			'Established global distribution network'
		],
		weaknesses: [
			'High dependence on mature markets for revenue',
			'Product pricing higher than industry average',
			'Slower adoption of emerging technologies',
			'Complex organizational structure affecting agility',
			'Challenges in talent retention in competitive markets'
		],
		opportunities: [
			'Expansion into emerging markets with growing demand',
			'Strategic acquisitions to enhance product offerings',
			'Increasing adoption of cloud services globally',
			'Growing demand for AI and machine learning solutions',
			'Partnerships with startups for innovation acceleration'
		],
		threats: [
			'Intense competition from established players and new entrants',
			'Rapid technological changes requiring constant adaptation',
			'Regulatory challenges in key markets',
			'Economic uncertainties affecting enterprise spending',
			'Cybersecurity risks and data privacy concerns'
		]
	};

	// Placeholder competitive positioning data
	const competitors = [
		{
			name: 'Competitor A',
			marketShare: 0.32,
			strengths: 'Market leader in cloud services, strong enterprise relationships',
			weaknesses: 'Limited presence in emerging markets, aging product portfolio'
		},
		{
			name: 'Competitor B',
			marketShare: 0.18,
			strengths: 'Innovative product development, strong in consumer segment',
			weaknesses: 'Less established enterprise presence, narrower product range'
		},
		{
			name: 'Competitor C',
			marketShare: 0.15,
			strengths: 'Cost-effective solutions, rapid growth in emerging markets',
			weaknesses: 'Limited R&D capabilities, brand perception challenges'
		},
		{
			name: 'Competitor D',
			marketShare: 0.12,
			strengths: 'Strong in specialized solutions, loyal customer base',
			weaknesses: 'Limited scale, geographic concentration'
		}
	];

	// Placeholder industry trends
	const industryTrends = [
		{
			trend: 'Cloud Computing Adoption',
			impact: 'High',
			description:
				'Continued migration to cloud-based solutions across industries, with increasing focus on hybrid and multi-cloud strategies.'
		},
		{
			trend: 'AI and Machine Learning Integration',
			impact: 'High',
			description:
				'Growing integration of AI capabilities into enterprise software and services, enabling automation and advanced analytics.'
		},
		{
			trend: 'Cybersecurity Focus',
			impact: 'Medium',
			description:
				'Increased investment in security solutions due to rising threats and regulatory requirements for data protection.'
		},
		{
			trend: 'Remote Work Technologies',
			impact: 'Medium',
			description:
				'Sustained demand for collaboration tools and infrastructure supporting distributed workforce models.'
		},
		{
			trend: 'Sustainability Initiatives',
			impact: 'Low',
			description:
				'Growing emphasis on environmental impact of technology, including energy-efficient data centers and sustainable practices.'
		}
	];

	// Format percentage
	function formatPercentage(value: number): string {
		return `${(value * 100).toFixed(1)}%`;
	}
</script>

<div class="space-y-8">
	<!-- SWOT Analysis -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">SWOT Analysis</h2>
		<p class="mb-6 text-gray-600">
			Strategic analysis of {company.name || 'the company'}'s strengths, weaknesses, opportunities,
			and threats.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Strengths -->
			<div class="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold text-green-700">Strengths</h3>
				<ul class="space-y-2">
					{#each swotAnalysis.strengths as strength}
						<li class="flex items-start">
							<span class="mt-1 mr-2 text-green-500">•</span>
							<span>{strength}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Weaknesses -->
			<div class="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold text-red-700">Weaknesses</h3>
				<ul class="space-y-2">
					{#each swotAnalysis.weaknesses as weakness}
						<li class="flex items-start">
							<span class="mt-1 mr-2 text-red-500">•</span>
							<span>{weakness}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Opportunities -->
			<div class="rounded-lg border border-blue-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold text-blue-700">Opportunities</h3>
				<ul class="space-y-2">
					{#each swotAnalysis.opportunities as opportunity}
						<li class="flex items-start">
							<span class="mt-1 mr-2 text-blue-500">•</span>
							<span>{opportunity}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Threats -->
			<div class="rounded-lg border border-yellow-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold text-yellow-700">Threats</h3>
				<ul class="space-y-2">
					{#each swotAnalysis.threats as threat}
						<li class="flex items-start">
							<span class="mt-1 mr-2 text-yellow-500">•</span>
							<span>{threat}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- Competitive Positioning -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Competitive Positioning</h2>
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Competitor
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Market Share
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Key Strengths
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Key Weaknesses
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each competitors as competitor}
						<tr>
							<td class="px-6 py-4 font-medium whitespace-nowrap">{competitor.name}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{formatPercentage(competitor.marketShare)}
							</td>
							<td class="px-6 py-4 text-sm text-gray-500">{competitor.strengths}</td>
							<td class="px-6 py-4 text-sm text-gray-500">{competitor.weaknesses}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Industry Trends -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Industry Trends</h2>
		<div class="space-y-4">
			{#each industryTrends as trend}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="flex flex-wrap items-center justify-between">
						<h3 class="text-lg font-semibold">{trend.trend}</h3>
						<span
							class="rounded-full px-3 py-1 text-sm font-medium {trend.impact === 'High'
								? 'bg-red-100 text-red-800'
								: trend.impact === 'Medium'
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-green-100 text-green-800'}"
						>
							{trend.impact} Impact
						</span>
					</div>
					<p class="mt-2 text-gray-600">{trend.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Market Positioning Chart Placeholder -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Market Positioning</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Market positioning chart will be implemented here</p>
				</div>
			</div>
		</div>
	</section>
</div>

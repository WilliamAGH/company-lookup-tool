<!-- 
  Financials.svelte
  
  This component renders the Financials tab content for the company detail page.
  It includes financial statements, key ratios, and performance charts.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	export let company: EnhancedCompanyData;

	// Placeholder financial data - in a real implementation, this would come from the company data
	const financialStatements = {
		years: ['2023', '2022', '2021', '2020'],
		revenue: [1250000000, 980000000, 750000000, 620000000],
		grossProfit: [750000000, 588000000, 450000000, 372000000],
		operatingIncome: [375000000, 294000000, 225000000, 186000000],
		netIncome: [250000000, 196000000, 150000000, 124000000]
	};

	const keyRatios = [
		{ name: 'P/E Ratio', value: 28.5 },
		{ name: 'EV/EBITDA', value: 15.2 },
		{ name: 'Price/Sales', value: 8.4 },
		{ name: 'Price/Book', value: 6.7 },
		{ name: 'Debt/Equity', value: 0.45 },
		{ name: 'ROE', value: 0.22 },
		{ name: 'ROA', value: 0.15 },
		{ name: 'Gross Margin', value: 0.6 }
	];

	// Format large numbers with commas and abbreviate if needed
	function formatFinancialNumber(num: number): string {
		if (num >= 1000000000) {
			return `$${(num / 1000000000).toFixed(1)}B`;
		} else if (num >= 1000000) {
			return `$${(num / 1000000).toFixed(1)}M`;
		} else if (num >= 1000) {
			return `$${(num / 1000).toFixed(1)}K`;
		} else {
			return `$${num}`;
		}
	}

	// Format ratio values
	function formatRatio(value: number): string {
		if (value < 0.01) {
			return value.toFixed(3);
		} else if (value < 1) {
			return value.toFixed(2);
		} else {
			return value.toFixed(1);
		}
	}
</script>

<div class="space-y-8">
	<!-- Financial Summary -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Financial Summary</h2>
		<p class="mb-6 text-gray-600">
			Key financial metrics and performance indicators for {company.name || 'the company'}.
		</p>

		<!-- Financial Statements Table -->
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Metric
						</th>
						{#each financialStatements.years as year}
							<th
								scope="col"
								class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								{year}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					<tr>
						<td class="px-6 py-4 font-medium whitespace-nowrap">Revenue</td>
						{#each financialStatements.revenue as value}
							<td class="px-6 py-4 text-right text-sm whitespace-nowrap text-gray-500">
								{formatFinancialNumber(value)}
							</td>
						{/each}
					</tr>
					<tr>
						<td class="px-6 py-4 font-medium whitespace-nowrap">Gross Profit</td>
						{#each financialStatements.grossProfit as value}
							<td class="px-6 py-4 text-right text-sm whitespace-nowrap text-gray-500">
								{formatFinancialNumber(value)}
							</td>
						{/each}
					</tr>
					<tr>
						<td class="px-6 py-4 font-medium whitespace-nowrap">Operating Income</td>
						{#each financialStatements.operatingIncome as value}
							<td class="px-6 py-4 text-right text-sm whitespace-nowrap text-gray-500">
								{formatFinancialNumber(value)}
							</td>
						{/each}
					</tr>
					<tr>
						<td class="px-6 py-4 font-medium whitespace-nowrap">Net Income</td>
						{#each financialStatements.netIncome as value}
							<td class="px-6 py-4 text-right text-sm whitespace-nowrap text-gray-500">
								{formatFinancialNumber(value)}
							</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Key Ratios -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Key Ratios</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each keyRatios as ratio}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="mb-2 text-sm font-medium text-gray-500">{ratio.name}</div>
					<div class="text-2xl font-bold">{formatRatio(ratio.value)}</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Revenue Growth Chart Placeholder -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Revenue Growth</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Revenue growth chart will be implemented here</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Profitability Chart Placeholder -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Profitability Metrics</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Profitability metrics chart will be implemented here</p>
				</div>
			</div>
		</div>
	</section>
</div>

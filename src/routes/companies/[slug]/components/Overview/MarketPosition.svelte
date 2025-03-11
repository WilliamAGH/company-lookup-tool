<!-- 
  MarketPosition.svelte
  
  This component displays key financial metrics for a company including
  market cap, revenue, profit margin, and growth rates.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';
	import { formatCurrency, formatPercentage } from '$lib/utils/formatters';

	// Props
	export let company: EnhancedCompanyData;

	// Placeholder data - in a real implementation, this would come from the company data
	const metrics = [
		{
			label: 'Market Cap',
			value: company.marketPosition.marketCapValue || 0,
			formatter: formatCurrency,
			change: 2.5,
			trend: 'up'
		},
		{
			label: 'Revenue (TTM)',
			value: company.financialMetrics.revenue || 0,
			formatter: formatCurrency,
			change: 1.8,
			trend: 'up'
		},
		{
			label: 'Profit Margin',
			value: company.financialMetrics.profitMargin || 0,
			formatter: formatPercentage,
			change: -0.5,
			trend: 'down'
		},
		{
			label: 'YoY Growth',
			value: company.financialMetrics.revenue || 0,
			formatter: formatPercentage,
			change: 3.2,
			trend: 'up'
		}
	];
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	{#each metrics as metric}
		<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div class="mb-2 text-sm font-medium text-gray-500">{metric.label}</div>
			<div class="flex items-end justify-between">
				<div class="text-2xl font-bold">{metric.formatter(Number(metric.value))}</div>
				<div
					class="flex items-center text-sm {metric.trend === 'up'
						? 'text-green-600'
						: 'text-red-600'}"
				>
					<span class="mr-1">{metric.change}%</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						{#if metric.trend === 'up'}
							<path
								fill-rule="evenodd"
								d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
								clip-rule="evenodd"
							/>
						{:else}
							<path
								fill-rule="evenodd"
								d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						{/if}
					</svg>
				</div>
			</div>
		</div>
	{/each}
</div>

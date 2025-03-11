<!-- 
  Products.svelte
  
  This component renders the Products tab content for the company detail page.
  It includes product listings, categories, and market share information.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	export let company: EnhancedCompanyData;

	// Placeholder product data - in a real implementation, this would come from the company data
	const products = [
		{
			name: 'Enterprise Cloud Platform',
			description:
				'A comprehensive cloud computing platform for businesses of all sizes, offering infrastructure, platform, and software services.',
			category: 'Cloud Services',
			marketShare: 0.28,
			revenue: 650000000,
			growth: 0.32,
			image: '/images/placeholders/no-company.svg'
		},
		{
			name: 'Data Analytics Suite',
			description:
				'Advanced analytics tools for processing and visualizing large datasets, with AI-powered insights and recommendations.',
			category: 'Software',
			marketShare: 0.15,
			revenue: 320000000,
			growth: 0.45,
			image: '/images/placeholders/no-news.svg'
		},
		{
			name: 'Security Solutions',
			description:
				'Enterprise-grade security products including threat detection, identity management, and compliance monitoring.',
			category: 'Software',
			marketShare: 0.12,
			revenue: 180000000,
			growth: 0.38,
			image: '/images/placeholders/no-news.svg'
		},
		{
			name: 'Smart Devices',
			description:
				'Connected hardware devices for businesses and consumers, including IoT sensors and smart office equipment.',
			category: 'Hardware',
			marketShare: 0.08,
			revenue: 100000000,
			growth: 0.22,
			image: '/images/placeholders/no-news.svg'
		}
	];

	// Format large numbers with commas and abbreviate if needed
	function formatRevenue(num: number): string {
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

	// Format percentage
	function formatPercentage(value: number): string {
		return `${(value * 100).toFixed(1)}%`;
	}

	// Handle image load errors
	function handleImageError(event: Event) {
		const imgElement = event.target as HTMLImageElement;
		imgElement.src = '/images/placeholders/no-news.svg';
	}
</script>

<div class="space-y-8">
	<!-- Products Overview -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Products & Services</h2>
		<p class="mb-6 text-gray-600">
			Key products and services offered by {company.name || 'the company'}, including market share
			and revenue contribution.
		</p>

		<!-- Product Cards -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each products as product}
				<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
					<div class="h-48 w-full overflow-hidden bg-gray-200">
						<img
							src={product.image}
							alt={product.name}
							class="h-full w-full object-cover"
							on:error={handleImageError}
						/>
					</div>
					<div class="p-6">
						<h3 class="mb-2 text-xl font-bold">{product.name}</h3>
						<p class="mb-4 text-gray-600">{product.description}</p>
						<div class="mb-4 grid grid-cols-2 gap-4">
							<div>
								<div class="text-sm font-medium text-gray-500">Category</div>
								<div class="font-medium">{product.category}</div>
							</div>
							<div>
								<div class="text-sm font-medium text-gray-500">Market Share</div>
								<div class="font-medium">{formatPercentage(product.marketShare)}</div>
							</div>
							<div>
								<div class="text-sm font-medium text-gray-500">Revenue</div>
								<div class="font-medium">{formatRevenue(product.revenue)}</div>
							</div>
							<div>
								<div class="text-sm font-medium text-gray-500">YoY Growth</div>
								<div class="font-medium text-green-600">{formatPercentage(product.growth)}</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Market Share Chart Placeholder -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Market Share by Product Category</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Market share chart will be implemented here</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Product Revenue Trends Placeholder -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Product Revenue Trends</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Product revenue trends chart will be implemented here</p>
				</div>
			</div>
		</div>
	</section>
</div>

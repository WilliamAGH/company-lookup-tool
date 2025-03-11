<!-- 
  Classification.svelte
  
  This component displays the company's business model, industry categories,
  and related tags.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	export let company: EnhancedCompanyData;

	// Placeholder data - in a real implementation, this would come from the company data
	const categories = [
		{ name: 'Software', percentage: 65 },
		{ name: 'Cloud Services', percentage: 25 },
		{ name: 'Hardware', percentage: 10 }
	];

	const tags = [
		'SaaS',
		'Enterprise',
		'B2B',
		'Cloud Computing',
		'AI',
		'Machine Learning',
		'Data Analytics'
	];
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<!-- Business Model -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Business Model</h3>
		<p class="text-gray-700">
			{company.classification.businessModel.join(', ') ||
				'No business model description available.'}
		</p>
	</div>

	<!-- Categories -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Industry Categories</h3>
		{#each categories as category}
			<div class="mb-3">
				<div class="mb-1 flex justify-between">
					<span class="text-sm font-medium">{category.name}</span>
					<span class="text-sm text-gray-500">{category.percentage}%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
					<div class="h-full rounded-full bg-blue-600" style="width: {category.percentage}%"></div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Tags -->
	<div class="lg:col-span-2">
		<h3 class="mb-3 text-lg font-semibold">Related Tags</h3>
		<div class="flex flex-wrap gap-2">
			{#each tags as tag}
				<span
					class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
				>
					{tag}
				</span>
			{/each}
		</div>
	</div>
</div>

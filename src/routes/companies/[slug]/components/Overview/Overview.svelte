<!-- 
  Overview.svelte
  
  This component renders the Overview tab content for the company detail page.
  It includes market position, classification, leadership, and global presence sections.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';
	import MarketPosition from './MarketPosition.svelte';
	import Classification from './Classification.svelte';
	import Leadership from './Leadership.svelte';
	import GlobalPresence from './GlobalPresence.svelte';

	// Props
	export let company: EnhancedCompanyData;
</script>

<div class="space-y-8">
	<!-- Market Position Section -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Financial Metrics</h2>
		<p class="mb-4 text-gray-600">Key performance indicators</p>
		<MarketPosition {company} />
	</section>

	<!-- Revenue by Region Section -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Revenue by Region</h2>
		<p class="mb-4 text-gray-600">Geographic distribution</p>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<!-- Placeholder for the revenue by region chart -->
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Revenue distribution visualization will be implemented here</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Classification Section -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Classification</h2>
		<p class="mb-4 text-gray-600">Business model and categories</p>
		<Classification {company} />
	</section>

	<!-- Leadership Section -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Leadership</h2>
		<p class="mb-4 text-gray-600">Key executives and board members</p>
		<Leadership {company} />
	</section>

	<!-- Global Presence Section -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Global Presence</h2>
		<p class="mb-4 text-gray-600">Office locations and employee distribution</p>
		<GlobalPresence {company} />
	</section>
</div>

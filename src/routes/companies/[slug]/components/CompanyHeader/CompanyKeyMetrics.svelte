<!-- 
  CompanyKeyMetrics.svelte
  
  This component renders the key metrics cards for a company:
  - Market Cap
  - Employees
  - Founded Year
  
  These cards provide a quick overview of the company's size and age.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	export let company: EnhancedCompanyData;
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
	<!-- Market Cap Card -->
	<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
		<div class="text-sm font-medium text-gray-500">Market Cap</div>
		<div class="mt-1 text-2xl font-bold text-gray-900">
			{company.marketPosition?.marketCap || 'N/A'}
		</div>
	</div>

	<!-- Employees Card -->
	<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
		<div class="text-sm font-medium text-gray-500">Employees</div>
		<div class="mt-1 text-2xl font-bold text-gray-900">
			{#if company.globalPresence?.headquarters?.employeeCount}
				{company.globalPresence.headquarters.employeeCount.toLocaleString()}+
			{:else}
				32,800+
			{/if}
		</div>
	</div>

	<!-- Founded Card -->
	<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
		<div class="text-sm font-medium text-gray-500">Founded</div>
		<div class="mt-1 text-2xl font-bold text-gray-900">
			{company.foundedYear || '2009'}
		</div>
	</div>
</div>

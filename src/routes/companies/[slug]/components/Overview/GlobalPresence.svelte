<!-- 
  GlobalPresence.svelte
  
  This component displays the company's global presence including
  headquarters, office locations, and employee distribution.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	// The company prop is required for type-checking but not currently used within the component
	// svelte-ignore export_let_unused
	export let company: EnhancedCompanyData;

	// Placeholder data - in a real implementation, this would come from the company data
	const headquarters = {
		city: 'San Francisco',
		state: 'CA',
		country: 'United States'
	};

	const officeLocations = [
		{ city: 'San Francisco', country: 'United States', employees: 2500 },
		{ city: 'New York', country: 'United States', employees: 1200 },
		{ city: 'London', country: 'United Kingdom', employees: 850 },
		{ city: 'Tokyo', country: 'Japan', employees: 650 },
		{ city: 'Berlin', country: 'Germany', employees: 450 },
		{ city: 'Sydney', country: 'Australia', employees: 350 }
	];

	const totalEmployees = officeLocations.reduce((sum, office) => sum + office.employees, 0);
</script>

<div class="space-y-6">
	<!-- Headquarters -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Headquarters</h3>
		<div class="flex items-start">
			<div
				class="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<div>
				<p class="font-medium">{headquarters.city}, {headquarters.state}</p>
				<p class="text-gray-600">{headquarters.country}</p>
			</div>
		</div>
	</div>

	<!-- Office Locations -->
	<div>
		<h3 class="mb-4 text-lg font-semibold">Office Locations</h3>
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Location
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Employees
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							% of Total
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each officeLocations as office}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="font-medium">{office.city}</div>
								<div class="text-sm text-gray-500">{office.country}</div>
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{office.employees.toLocaleString()}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{((office.employees / totalEmployees) * 100).toFixed(1)}%
							</td>
						</tr>
					{/each}
					<tr class="bg-gray-50">
						<td class="px-6 py-4 font-medium whitespace-nowrap">Total</td>
						<td class="px-6 py-4 font-medium whitespace-nowrap">
							{totalEmployees.toLocaleString()}
						</td>
						<td class="px-6 py-4 font-medium whitespace-nowrap">100%</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Map Placeholder -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Global Presence Map</h3>
		<div class="h-64 w-full bg-gray-50 p-4">
			<div class="flex h-full flex-col items-center justify-center">
				<p class="text-gray-500">Interactive map will be implemented here</p>
			</div>
		</div>
	</div>
</div>

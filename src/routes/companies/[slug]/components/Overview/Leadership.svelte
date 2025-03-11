<!-- 
  Leadership.svelte
  
  This component displays the company's leadership team including
  executives and board members.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	// The company prop is required for type-checking but not currently used within the component
	// svelte-ignore export_let_unused
	export let company: EnhancedCompanyData;

	// Placeholder data - in a real implementation, this would come from the company data
	const executives = [
		{
			name: 'Jane Smith',
			title: 'Chief Executive Officer',
			photo: '/images/placeholders/no-avatar.svg',
			since: '2018'
		},
		{
			name: 'John Doe',
			title: 'Chief Financial Officer',
			photo: '/images/placeholders/no-avatar.svg',
			since: '2019'
		},
		{
			name: 'Emily Johnson',
			title: 'Chief Technology Officer',
			photo: '/images/placeholders/no-avatar.svg',
			since: '2020'
		},
		{
			name: 'Michael Brown',
			title: 'Chief Operating Officer',
			photo: '/images/placeholders/no-avatar.svg',
			since: '2021'
		}
	];

	const boardMembers = [
		{
			name: 'Robert Wilson',
			title: 'Chairman',
			photo: '/images/placeholders/no-avatar.svg'
		},
		{
			name: 'Sarah Davis',
			title: 'Board Member',
			photo: '/images/placeholders/no-avatar.svg'
		},
		{
			name: 'David Martinez',
			title: 'Board Member',
			photo: '/images/placeholders/no-avatar.svg'
		}
	];

	// Function to handle image load errors
	function handleImageError(event: Event) {
		const imgElement = event.target as HTMLImageElement;
		imgElement.src = '/images/placeholders/no-avatar.svg';
	}
</script>

<div class="space-y-8">
	<!-- Executive Team -->
	<div>
		<h3 class="mb-4 text-lg font-semibold">Executive Team</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each executives as executive}
				<div
					class="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
				>
					<div class="mb-3 h-16 w-16 overflow-hidden rounded-full">
						<img
							src={executive.photo}
							alt={executive.name}
							class="h-full w-full object-cover"
							on:error={handleImageError}
						/>
					</div>
					<h4 class="mb-1 text-base font-medium">{executive.name}</h4>
					<p class="mb-2 text-sm text-gray-600">{executive.title}</p>
					<p class="text-xs text-gray-500">Since {executive.since}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Board of Directors -->
	<div>
		<h3 class="mb-4 text-lg font-semibold">Board of Directors</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each boardMembers as member}
				<div class="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="mr-4 h-12 w-12 overflow-hidden rounded-full">
						<img
							src={member.photo}
							alt={member.name}
							class="h-full w-full object-cover"
							on:error={handleImageError}
						/>
					</div>
					<div>
						<h4 class="text-base font-medium">{member.name}</h4>
						<p class="text-sm text-gray-600">{member.title}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- 
  TabNavigation.svelte
  
  This component renders the tab navigation for the company detail page.
  It allows users to switch between different tabs of company information.
-->
<script lang="ts">
	// Props
	export let activeTab: string;
	export let onTabChange: (tab: string) => void;

	// Define available tabs
	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'financials', label: 'Financials' },
		{ id: 'products', label: 'Products' },
		{ id: 'analysis', label: 'Analysis' },
		{ id: 'news', label: 'News' },
		{ id: 'faq', label: 'FAQ' }
	];
</script>

<div class="border-b border-gray-200">
	<nav class="-mb-px flex space-x-8" aria-label="Tabs">
		{#each tabs as tab}
			<button
				class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab === tab.id
					? 'border-blue-500 text-blue-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				aria-current={activeTab === tab.id ? 'page' : undefined}
				on:click={() => onTabChange(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>
</div>

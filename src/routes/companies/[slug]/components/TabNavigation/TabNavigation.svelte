<!-- 
  TabNavigation.svelte
  
  This component renders a horizontal tab bar for navigating between different sections
  of the company detail page. It handles both desktop and mobile layouts.
  
  Features:
  - Horizontal tab bar with active state styling
  - Mobile-responsive design (converts to dropdown on small screens)
  - Accessibility features (keyboard navigation, ARIA attributes)
  - Integration with page routing via query parameters
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Props
	export let activeTab: string;
	export let onTabChange: ((tabId: string) => void) | undefined = undefined; // Optional callback when tab changes

	// Tab definitions
	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'financials', label: 'Financials' },
		{ id: 'products', label: 'Products' },
		{ id: 'analysis', label: 'Analysis' },
		{ id: 'news', label: 'News' },
		{ id: 'faq', label: 'FAQ' }
	];

	// Handle tab change
	function handleTabChange(tabId: string) {
		// If onTabChange callback is provided, use it
		if (onTabChange) {
			onTabChange(tabId);
			return;
		}

		// Otherwise handle internally
		// Update URL with the new tab
		const url = new URL($page.url);
		url.searchParams.set('tab', tabId);
		goto(url.toString(), { keepFocus: true, noScroll: true });
		activeTab = tabId;
	}

	// Mobile dropdown state
	let isDropdownOpen = false;
	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}
	function closeDropdown() {
		isDropdownOpen = false;
	}

	// Get the active tab label for mobile display
	$: activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Overview';
</script>

<!-- Desktop tabs (hidden on mobile) -->
<div class="mb-6 hidden md:block">
	<div class="border-b border-gray-200">
		<nav class="-mb-px flex" aria-label="Company information tabs">
			{#each tabs as tab}
				<button
					class="cursor-pointer border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {activeTab ===
					tab.id
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					aria-current={activeTab === tab.id ? 'page' : undefined}
					on:click={() => handleTabChange(tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>
</div>

<!-- Mobile dropdown (hidden on desktop) -->
<div class="relative mb-6 md:hidden">
	<button
		type="button"
		class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		id="mobile-tabs-menu-button"
		aria-expanded={isDropdownOpen}
		aria-haspopup="true"
		on:click={toggleDropdown}
	>
		<span>{activeTabLabel}</span>
		<svg
			class="ml-2 h-5 w-5 text-gray-400"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	{#if isDropdownOpen}
		<div
			class="ring-opacity-5 absolute left-0 z-10 mt-1 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="mobile-tabs-menu-button"
			tabindex="-1"
		>
			<div class="py-1" role="none">
				{#each tabs as tab}
					<button
						class="block w-full cursor-pointer px-4 py-2 text-left text-sm {activeTab === tab.id
							? 'bg-gray-100 text-gray-900'
							: 'text-gray-700 hover:bg-gray-50'}"
						role="menuitem"
						tabindex="-1"
						on:click={() => {
							handleTabChange(tab.id);
							closeDropdown();
						}}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Tab content container -->
<div class="tab-content">
	<slot />
</div>

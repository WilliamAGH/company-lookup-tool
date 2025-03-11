<script lang="ts">
	import { onMount } from 'svelte';
	import JsonDataTreeVisualizer from './jsonDataTreeVisualizer.svelte';

	// Props
	export let data: any;
	export let title: string = 'Company Data Explorer';
	export let initialExpandedDepth: number = 10; // Default to fully expanded

	// Component state
	let expandedPaths = new Set<string>();
	let searchQuery = '';
	let filterType = 'All Types';
	let expandedDepth = initialExpandedDepth;

	// Type styling
	const typeColors: Record<string, string> = {
		string: 'text-green-600 dark:text-green-400',
		number: 'text-blue-600 dark:text-blue-400',
		boolean: 'text-purple-600 dark:text-purple-400',
		null: 'text-gray-400 dark:text-gray-500',
		object: 'text-gray-800 dark:text-white',
		array: 'text-gray-800 dark:text-white'
	};

	// Initialize expanded paths based on initialExpandedDepth
	onMount(() => {
		expandInitialPaths(data, '', 0, initialExpandedDepth);
	});

	function expandInitialPaths(obj: any, path: string, currentDepth: number, maxDepth: number) {
		if (currentDepth >= maxDepth) return;
		if (!obj || typeof obj !== 'object') return;

		// Add current path to expanded paths
		expandedPaths.add(path);

		if (Array.isArray(obj)) {
			obj.forEach((item, index) => {
				if (item && typeof item === 'object') {
					expandInitialPaths(
						item,
						path ? `${path}.${index}` : `${index}`,
						currentDepth + 1,
						maxDepth
					);
				}
			});
		} else {
			Object.keys(obj).forEach((key) => {
				if (obj[key] && typeof obj[key] === 'object') {
					expandInitialPaths(obj[key], path ? `${path}.${key}` : key, currentDepth + 1, maxDepth);
				}
			});
		}
	}

	function toggleExpand(path: string) {
		if (expandedPaths.has(path)) {
			expandedPaths.delete(path);
		} else {
			expandedPaths.add(path);
		}
		expandedPaths = new Set(expandedPaths); // Trigger reactivity
	}

	function isExpanded(path: string): boolean {
		return expandedPaths.has(path);
	}

	function expandAll() {
		const allPaths = getAllPaths(data);
		expandedPaths = new Set(allPaths);
	}

	function collapseAll() {
		expandedPaths = new Set(['']); // Keep only root expanded
	}

	function getAllPaths(obj: any, path: string = ''): string[] {
		if (!obj || typeof obj !== 'object') return [];

		let paths = [path];

		if (Array.isArray(obj)) {
			obj.forEach((item, index) => {
				if (item && typeof item === 'object') {
					paths = [...paths, ...getAllPaths(item, path ? `${path}.${index}` : `${index}`)];
				}
			});
		} else {
			Object.keys(obj).forEach((key) => {
				if (obj[key] && typeof obj[key] === 'object') {
					paths = [...paths, ...getAllPaths(obj[key], path ? `${path}.${key}` : key)];
				}
			});
		}

		return paths;
	}

	function increaseDepth() {
		expandedDepth++;
		expandedPaths.clear();
		expandInitialPaths(data, '', 0, expandedDepth);
	}

	function decreaseDepth() {
		if (expandedDepth > 1) {
			expandedDepth--;
			expandedPaths.clear();
			expandInitialPaths(data, '', 0, expandedDepth);
		}
	}

	function getType(value: any): string {
		if (value === null || value === undefined) return 'null';
		if (Array.isArray(value)) return 'array';
		return typeof value;
	}

	function getValueClass(value: any): string {
		const type = getType(value);
		return typeColors[type] || 'text-gray-900 dark:text-white';
	}

	function formatValue(value: any): string {
		if (value === null || value === undefined) {
			return 'null';
		} else if (typeof value === 'string') {
			return `"${value}"`;
		}
		return String(value);
	}

	// Get product name if available (for labeling)
	function getProductName(item: any): string | null {
		if (item && typeof item === 'object') {
			if (item.product_name) return item.product_name;
			if (item.name) return item.name;
		}
		return null;
	}

	// Search functionality
	function matchesSearch(path: string, value: any): boolean {
		if (!searchQuery) return true;

		const searchLower = searchQuery.toLowerCase();

		// Check if path matches
		if (path.toLowerCase().includes(searchLower)) return true;

		// Check if value matches
		if (value === null || value === undefined) {
			return 'null'.includes(searchLower);
		}

		if (typeof value === 'object') {
			// For objects, stringify and search
			return JSON.stringify(value).toLowerCase().includes(searchLower);
		}

		// For primitives, convert to string and search
		return String(value).toLowerCase().includes(searchLower);
	}

	// Type filtering
	function matchesTypeFilter(value: any): boolean {
		if (filterType === 'All Types') return true;

		const type = getType(value);

		switch (filterType) {
			case 'Objects':
				return type === 'object';
			case 'Arrays':
				return type === 'array';
			case 'Strings':
				return type === 'string';
			case 'Numbers':
				return type === 'number';
			default:
				return true;
		}
	}

	// Copy to clipboard functionality
	function copyToClipboard() {
		const jsonString = JSON.stringify(data, null, 2);
		navigator.clipboard
			.writeText(jsonString)
			.then(() => {
				// Show success message
				alert('JSON copied to clipboard');
			})
			.catch((err) => {
				console.error('Failed to copy: ', err);
			});
	}

	// Download JSON functionality
	function downloadJSON() {
		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.json`;
		document.body.appendChild(a);
		a.click();

		// Cleanup
		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 100);
	}

	// Count total tokens and calculate cost
	let totalTokens = data?._meta?.cost?.totalTokens || 1324;
	let costUSD = data?._meta?.cost?.costUSD || 0.01324;
</script>

<!-- Modern Tableau-Style JSON Viewer -->
<div class="w-full space-y-4 rounded-lg border bg-white p-6 shadow-lg dark:bg-gray-800">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
		<div class="flex space-x-2">
			<button
				class="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
				on:click={expandAll}
			>
				Expand All
			</button>
			<button
				class="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
				on:click={collapseAll}
			>
				Collapse All
			</button>
		</div>
	</div>

	<!-- Search and filters -->
	<div class="flex items-center space-x-4">
		<div class="relative flex-grow">
			<input
				type="text"
				placeholder="Search in JSON..."
				class="w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				bind:value={searchQuery}
			/>
			<svg
				class="absolute top-2.5 left-3 h-5 w-5 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				></path></svg
			>
		</div>
		<select
			class="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			bind:value={filterType}
		>
			<option>All Types</option>
			<option>Objects</option>
			<option>Arrays</option>
			<option>Strings</option>
			<option>Numbers</option>
		</select>
	</div>

	<!-- Data visualization header -->
	<div class="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
		<div class="flex items-center space-x-2">
			{#if data?.company}
				<span
					class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>company</span
				>
			{/if}
			{#if data?.products}
				<span
					class="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>products</span
				>
			{/if}
			{#if Array.isArray(data?.products)}
				<span class="text-sm text-gray-500 dark:text-gray-400">{data.products.length} items</span>
			{/if}
		</div>
		<div class="flex items-center space-x-2">
			<button
				class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
				on:click={downloadJSON}
				title="Download JSON"
				aria-label="Download JSON file"
			>
				<svg
					class="h-5 w-5 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					></path></svg
				>
			</button>
			<button
				class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
				on:click={copyToClipboard}
				title="Copy to clipboard"
				aria-label="Copy JSON to clipboard"
			>
				<svg
					class="h-5 w-5 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					></path></svg
				>
			</button>
		</div>
	</div>

	<!-- Data tree visualization using the JsonDataTreeVisualizer component -->
	<JsonDataTreeVisualizer
		{data}
		{searchQuery}
		{filterType}
		{expandedPaths}
		{getValueClass}
		{formatValue}
		{getProductName}
		{toggleExpand}
		{isExpanded}
		{matchesSearch}
		{matchesTypeFilter}
	/>
</div>

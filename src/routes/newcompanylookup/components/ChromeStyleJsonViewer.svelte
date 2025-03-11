<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { slide } from 'svelte/transition';

	// Props
	export let data: any;
	export let title: string = 'Raw OpenAI Response';
	export let initialExpandedDepth: number = 10; // Default to fully expanded

	// Component state
	let expandedPaths = new Set<string>();
	let copyButtonText = 'Copy';
	let downloadButtonText = 'Download';

	// Type-based syntax highlighting colors
	const syntaxColors = {
		key: 'text-purple-600 dark:text-purple-400',
		string: 'text-green-600 dark:text-green-400',
		number: 'text-blue-600 dark:text-blue-400',
		boolean: 'text-amber-600 dark:text-amber-400',
		null: 'text-gray-500 dark:text-gray-400',
		bracket: 'text-gray-800 dark:text-white',
		colon: 'text-gray-500 dark:text-gray-400',
		comma: 'text-gray-500 dark:text-gray-400',
		comment: 'text-gray-500 dark:text-gray-400'
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

	function getValueClass(value: any): string {
		if (value === null || value === undefined) {
			return syntaxColors.null;
		} else if (typeof value === 'string') {
			return syntaxColors.string;
		} else if (typeof value === 'number') {
			return syntaxColors.number;
		} else if (typeof value === 'boolean') {
			return syntaxColors.boolean;
		}
		return syntaxColors.bracket;
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

	// Copy to clipboard functionality
	async function copyToClipboard() {
		const jsonString = JSON.stringify(data, null, 2);
		try {
			await navigator.clipboard.writeText(jsonString);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy: ', err);
			copyButtonText = 'Failed';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		}
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
			downloadButtonText = 'Downloaded!';
			setTimeout(() => {
				downloadButtonText = 'Download';
			}, 2000);
		}, 100);
	}

	// Get key information for special highlighting
	function getKeyInfo(key: string): { isSpecial: boolean; label: string } {
		const specialKeys: Record<string, string> = {
			entity: 'Entity',
			products: 'Products',
			details: 'Details',
			competitors: 'Competitors',
			_meta: 'Metadata',
			choices: 'API Choices',
			usage: 'API Usage',
			message: 'Response Message',
			function_call: 'Function Call (Legacy)',
			tool_calls: 'Tool Calls',
			arguments: 'Function Arguments',
			function: 'Function Details',
			type: 'Type'
		};

		if (key in specialKeys) {
			return { isSpecial: true, label: specialKeys[key] };
		}

		return { isSpecial: false, label: '' };
	}
</script>

<!-- Clean Chrome DevTools-Style JSON Viewer -->
<div class="w-full space-y-4 rounded-lg border bg-white p-6 shadow-md dark:bg-gray-800">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
		<div class="flex space-x-2">
			<button
				class="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={copyToClipboard}
			>
				{copyButtonText}
			</button>
			<button
				class="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={downloadJSON}
			>
				{downloadButtonText}
			</button>
		</div>
	</div>

	<div
		class="max-h-[500px] overflow-auto rounded-md bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900"
	>
		{#if typeof data !== 'object' || data === null}
			<div class="text-gray-500 dark:text-gray-400">
				{data === null ? 'null' : formatValue(data)}
			</div>
		{:else}
			<!-- Root node -->
			<div
				class="group flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
			>
				<button
					class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
					on:click={() => toggleExpand('')}
				>
					{#if isExpanded('')}
						<svg
							class="h-3 w-3 text-gray-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path></svg
						>
					{:else}
						<svg
							class="h-3 w-3 text-gray-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							></path></svg
						>
					{/if}
				</button>
				<span class="text-gray-800 dark:text-white">{Array.isArray(data) ? '[' : '{'}</span>
			</div>

			{#if isExpanded('')}
				{#if Array.isArray(data)}
					{#each data as item, index}
						{@const path = index.toString()}
						<div
							class="group ml-6 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
						>
							{#if typeof item === 'object' && item !== null}
								<button
									class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
									on:click={() => toggleExpand(path)}
								>
									{#if isExpanded(path)}
										<svg
											class="h-3 w-3 text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											></path></svg
										>
									{:else}
										<svg
											class="h-3 w-3 text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											></path></svg
										>
									{/if}
								</button>
							{:else}
								<span class="w-4"></span>
							{/if}
							<span class={syntaxColors.key}>{index}</span>
							<span class={syntaxColors.colon}>:</span>
							{#if typeof item === 'object' && item !== null}
								<span class={syntaxColors.bracket}>{Array.isArray(item) ? '[' : '{'}</span>
								{#if getProductName(item)}
									<span class={syntaxColors.comment + ' ml-2 text-xs'}
										>// {getProductName(item)}</span
									>
								{/if}
							{:else}
								<span class={getValueClass(item)}>{formatValue(item)}</span>
							{/if}
							{#if index < data.length - 1}
								<span class={syntaxColors.comma}>,</span>
							{/if}
						</div>

						{#if isExpanded(path) && typeof item === 'object' && item !== null}
							{#if Array.isArray(item)}
								{#each item as subItem, subIndex}
									<div
										class="group ml-12 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
									>
										{#if typeof subItem === 'object' && subItem !== null}
											<button
												class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
												on:click={() => toggleExpand(`${path}.${subIndex}`)}
											>
												{#if isExpanded(`${path}.${subIndex}`)}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														></path></svg
													>
												{:else}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 5l7 7-7 7"
														></path></svg
													>
												{/if}
											</button>
										{:else}
											<span class="w-4"></span>
										{/if}
										<span class={syntaxColors.key}>{subIndex}</span>
										<span class={syntaxColors.colon}>:</span>
										{#if typeof subItem === 'object' && subItem !== null}
											<span class={syntaxColors.bracket}>{Array.isArray(subItem) ? '[' : '{'}</span>
										{:else}
											<span class={getValueClass(subItem)}>{formatValue(subItem)}</span>
										{/if}
										{#if subIndex < item.length - 1}
											<span class={syntaxColors.comma}>,</span>
										{/if}
									</div>
								{/each}
							{:else}
								{#each Object.entries(item) as [subKey, subValue], subIndex}
									<div
										class="group ml-12 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
									>
										{#if typeof subValue === 'object' && subValue !== null}
											<button
												class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
												on:click={() => toggleExpand(`${path}.${subKey}`)}
											>
												{#if isExpanded(`${path}.${subKey}`)}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														></path></svg
													>
												{:else}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 5l7 7-7 7"
														></path></svg
													>
												{/if}
											</button>
										{:else}
											<span class="w-4"></span>
										{/if}
										<span class={syntaxColors.key}>"{subKey}"</span>
										<span class={syntaxColors.colon}>:</span>
										{#if typeof subValue === 'object' && subValue !== null}
											<span class={syntaxColors.bracket}>{Array.isArray(subValue) ? '[' : '{'}</span
											>
										{:else}
											<span class={getValueClass(subValue)}>{formatValue(subValue)}</span>
										{/if}
										{#if subIndex < Object.keys(item).length - 1}
											<span class={syntaxColors.comma}>,</span>
										{/if}
									</div>
								{/each}
							{/if}
							<div
								class="group ml-6 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
							>
								<span class={syntaxColors.bracket}>{Array.isArray(item) ? ']' : '}'}</span>
								{#if index < data.length - 1}
									<span class={syntaxColors.comma}>,</span>
								{/if}
							</div>
						{/if}
					{/each}
				{:else}
					{#each Object.entries(data) as [key, value], index}
						{@const path = key}
						<div
							class="group ml-6 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
						>
							{#if typeof value === 'object' && value !== null}
								<button
									class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
									on:click={() => toggleExpand(path)}
								>
									{#if isExpanded(path)}
										<svg
											class="h-3 w-3 text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											></path></svg
										>
									{:else}
										<svg
											class="h-3 w-3 text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											></path></svg
										>
									{/if}
								</button>
							{:else}
								<span class="w-4"></span>
							{/if}
							<span class={syntaxColors.key}>"{key}"</span>
							<span class={syntaxColors.colon}>:</span>
							{#if typeof value === 'object' && value !== null}
								<span class={syntaxColors.bracket}>{Array.isArray(value) ? '[' : '{'}</span>
								{#if getKeyInfo(key).isSpecial}
									<span class={syntaxColors.comment + ' ml-2 text-xs'}
										>// {getKeyInfo(key).label}</span
									>
								{/if}
							{:else}
								<span class={getValueClass(value)}>{formatValue(value)}</span>
							{/if}
							{#if index < Object.keys(data).length - 1}
								<span class={syntaxColors.comma}>,</span>
							{/if}
						</div>

						{#if isExpanded(path) && typeof value === 'object' && value !== null}
							{#if Array.isArray(value)}
								{#each value as item, itemIndex}
									<div
										class="group ml-12 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
									>
										{#if typeof item === 'object' && item !== null}
											<button
												class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
												on:click={() => toggleExpand(`${path}.${itemIndex}`)}
											>
												{#if isExpanded(`${path}.${itemIndex}`)}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														></path></svg
													>
												{:else}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 5l7 7-7 7"
														></path></svg
													>
												{/if}
											</button>
										{:else}
											<span class="w-4"></span>
										{/if}
										<span class={syntaxColors.key}>{itemIndex}</span>
										<span class={syntaxColors.colon}>:</span>
										{#if typeof item === 'object' && item !== null}
											<span class={syntaxColors.bracket}>{Array.isArray(item) ? '[' : '{'}</span>
											{#if getProductName(item)}
												<span class={syntaxColors.comment + ' ml-2 text-xs'}
													>// {getProductName(item)}</span
												>
											{/if}
										{:else}
											<span class={getValueClass(item)}>{formatValue(item)}</span>
										{/if}
										{#if itemIndex < value.length - 1}
											<span class={syntaxColors.comma}>,</span>
										{/if}
									</div>
								{/each}
							{:else}
								{#each Object.entries(value) as [subKey, subValue], subIndex}
									<div
										class="group ml-12 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
									>
										{#if typeof subValue === 'object' && subValue !== null}
											<button
												class="mr-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
												on:click={() => toggleExpand(`${path}.${subKey}`)}
											>
												{#if isExpanded(`${path}.${subKey}`)}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														></path></svg
													>
												{:else}
													<svg
														class="h-3 w-3 text-gray-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 5l7 7-7 7"
														></path></svg
													>
												{/if}
											</button>
										{:else}
											<span class="w-4"></span>
										{/if}
										<span class={syntaxColors.key}>"{subKey}"</span>
										<span class={syntaxColors.colon}>:</span>
										{#if typeof subValue === 'object' && subValue !== null}
											<span class={syntaxColors.bracket}>{Array.isArray(subValue) ? '[' : '{'}</span
											>
										{:else}
											<span class={getValueClass(subValue)}>{formatValue(subValue)}</span>
										{/if}
										{#if subIndex < Object.keys(value).length - 1}
											<span class={syntaxColors.comma}>,</span>
										{/if}
									</div>
								{/each}
							{/if}
							<div
								class="group ml-6 flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
							>
								<span class={syntaxColors.bracket}>{Array.isArray(value) ? ']' : '}'}</span>
								{#if index < Object.keys(data).length - 1}
									<span class={syntaxColors.comma}>,</span>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
				<div
					class="group flex items-start rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800/50"
				>
					<span class={syntaxColors.bracket}>{Array.isArray(data) ? ']' : '}'}</span>
				</div>
			{/if}
		{/if}
	</div>
</div>

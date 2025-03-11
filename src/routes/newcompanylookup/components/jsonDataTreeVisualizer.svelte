<script lang="ts">
	import { slide } from 'svelte/transition';

	// Props
	export let data: any;
	export let searchQuery: string = '';
	export let filterType: string = 'All Types';
	export let expandedPaths: Set<string>;
	export let getValueClass: (value: any) => string;
	export let formatValue: (value: any) => string;
	export let getProductName: (item: any) => string | null;
	export let toggleExpand: (path: string) => void;
	export let isExpanded: (path: string) => boolean;
	export let matchesSearch: (path: string, value: any) => boolean;
	export let matchesTypeFilter: (value: any) => boolean;
</script>

<!-- Data tree visualization -->
<div
	class="max-h-[500px] overflow-auto rounded-md bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900"
>
	{#if typeof data !== 'object' || data === null}
		<div class="text-gray-500 dark:text-gray-400">
			{data === null ? 'null' : formatValue(data)}
		</div>
	{:else}
		<!-- Root node -->
		<div class="mb-2">
			<div class="flex items-center">
				<button
					class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
					on:click={() => toggleExpand('')}
				>
					{#if isExpanded('')}
						<svg
							class="h-4 w-4 text-gray-500"
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
							class="h-4 w-4 text-gray-500"
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
				<span class="font-medium text-gray-800 dark:text-white">
					{Array.isArray(data) ? `Array(${data.length})` : `Object{${Object.keys(data).length}}`}
				</span>
				<span class="ml-2 text-xs text-gray-500">root</span>
			</div>
		</div>

		{#if isExpanded('')}
			<div class="ml-6 border-l border-gray-300 pl-4 dark:border-gray-600">
				{#if Array.isArray(data)}
					{#each data as item, index}
						{@const path = index.toString()}
						{#if matchesSearch(path, item) && matchesTypeFilter(item)}
							<div class="mb-2" in:slide={{ duration: 150 }}>
								<div class="flex items-center">
									{#if typeof item === 'object' && item !== null}
										<button
											class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
											on:click={() => toggleExpand(path)}
										>
											{#if isExpanded(path)}
												<svg
													class="h-4 w-4 text-gray-500"
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
													class="h-4 w-4 text-gray-500"
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
										<div class="mr-2 w-5"></div>
									{/if}
									<span class="text-gray-500 dark:text-gray-400">{index}: </span>
									{#if typeof item === 'object' && item !== null}
										<span class="ml-1 font-medium text-gray-800 dark:text-white">
											{Array.isArray(item)
												? `Array(${item.length})`
												: `Object{${Object.keys(item).length}}`}
										</span>
										{#if getProductName(item)}
											<span
												class="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
											>
												{getProductName(item)}
											</span>
										{/if}
									{:else}
										<span class={getValueClass(item)}>{formatValue(item)}</span>
									{/if}
								</div>

								{#if isExpanded(path) && typeof item === 'object' && item !== null}
									<div class="ml-6 border-l border-gray-300 pl-4 dark:border-gray-600">
										{#each Object.entries(item) as [key, value]}
											{#if matchesSearch(`${path}.${key}`, value) && matchesTypeFilter(value)}
												<div class="mb-2" in:slide={{ duration: 150 }}>
													<div class="flex items-center">
														{#if typeof value === 'object' && value !== null}
															<button
																class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
																on:click={() => toggleExpand(`${path}.${key}`)}
															>
																{#if isExpanded(`${path}.${key}`)}
																	<svg
																		class="h-4 w-4 text-gray-500"
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
																		class="h-4 w-4 text-gray-500"
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
															<div class="mr-2 w-5"></div>
														{/if}
														<span class="text-gray-500 dark:text-gray-400">{key}: </span>
														{#if typeof value === 'object' && value !== null}
															<span class="ml-1 font-medium text-gray-800 dark:text-white">
																{Array.isArray(value)
																	? `Array(${value.length})`
																	: `Object{${Object.keys(value).length}}`}
															</span>
														{:else}
															<span class={getValueClass(value)}>{formatValue(value)}</span>
														{/if}
													</div>

													{#if isExpanded(`${path}.${key}`) && typeof value === 'object' && value !== null}
														<div class="ml-6 border-l border-gray-300 pl-4 dark:border-gray-600">
															<!-- Recursive rendering for nested objects/arrays would go here -->
															<svelte:self
																data={value}
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
													{/if}
												</div>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				{:else}
					{#each Object.entries(data) as [key, value]}
						{@const path = key}
						{#if matchesSearch(path, value) && matchesTypeFilter(value)}
							<div class="mb-2" in:slide={{ duration: 150 }}>
								<div class="flex items-center">
									{#if typeof value === 'object' && value !== null}
										<button
											class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
											on:click={() => toggleExpand(path)}
										>
											{#if isExpanded(path)}
												<svg
													class="h-4 w-4 text-gray-500"
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
													class="h-4 w-4 text-gray-500"
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
										<div class="mr-2 w-5"></div>
									{/if}
									<span class="text-gray-500 dark:text-gray-400">{key}: </span>
									{#if typeof value === 'object' && value !== null}
										<span class="ml-1 font-medium text-gray-800 dark:text-white">
											{Array.isArray(value)
												? `Array(${value.length})`
												: `Object{${Object.keys(value).length}}`}
										</span>
										{#if key === 'company'}
											<span
												class="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
												>company</span
											>
										{:else if key === 'products'}
											<span
												class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
												>products</span
											>
										{:else if key === '_meta'}
											<span
												class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
												>metadata</span
											>
										{/if}
									{:else}
										<span class={getValueClass(value)}>{formatValue(value)}</span>
									{/if}
								</div>

								{#if isExpanded(path) && typeof value === 'object' && value !== null}
									<div class="ml-6 border-l border-gray-300 pl-4 dark:border-gray-600">
										{#if Array.isArray(value)}
											{#each value as item, index}
												{#if matchesSearch(`${path}.${index}`, item) && matchesTypeFilter(item)}
													<div class="mb-2" in:slide={{ duration: 150 }}>
														<div class="flex items-center">
															{#if typeof item === 'object' && item !== null}
																<button
																	class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
																	on:click={() => toggleExpand(`${path}.${index}`)}
																>
																	{#if isExpanded(`${path}.${index}`)}
																		<svg
																			class="h-4 w-4 text-gray-500"
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
																			class="h-4 w-4 text-gray-500"
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
																<div class="mr-2 w-5"></div>
															{/if}
															<span class="text-gray-500 dark:text-gray-400">{index}: </span>
															{#if typeof item === 'object' && item !== null}
																<span class="ml-1 font-medium text-gray-800 dark:text-white">
																	{Array.isArray(item)
																		? `Array(${item.length})`
																		: `Object{${Object.keys(item).length}}`}
																</span>
																{#if getProductName(item)}
																	<span
																		class="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
																	>
																		{getProductName(item)}
																	</span>
																{/if}
															{:else}
																<span class={getValueClass(item)}>{formatValue(item)}</span>
															{/if}
														</div>

														{#if isExpanded(`${path}.${index}`) && typeof item === 'object' && item !== null}
															<div class="ml-6 border-l border-gray-300 pl-4 dark:border-gray-600">
																<!-- Recursive rendering for nested objects/arrays would go here -->
																<svelte:self
																	data={item}
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
														{/if}
													</div>
												{/if}
											{/each}
										{:else}
											{#each Object.entries(value) as [subKey, subValue]}
												{#if matchesSearch(`${path}.${subKey}`, subValue) && matchesTypeFilter(subValue)}
													<div class="mb-2" in:slide={{ duration: 150 }}>
														<div class="flex items-center">
															{#if typeof subValue === 'object' && subValue !== null}
																<button
																	class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
																	on:click={() => toggleExpand(`${path}.${subKey}`)}
																>
																	{#if isExpanded(`${path}.${subKey}`)}
																		<svg
																			class="h-4 w-4 text-gray-500"
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
																			class="h-4 w-4 text-gray-500"
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
																<div class="mr-2 w-5"></div>
															{/if}
															<span class="text-gray-500 dark:text-gray-400">{subKey}: </span>
															{#if typeof subValue === 'object' && subValue !== null}
																<span class="ml-1 font-medium text-gray-800 dark:text-white">
																	{Array.isArray(subValue)
																		? `Array(${subValue.length})`
																		: `Object{${Object.keys(subValue).length}}`}
																</span>
															{:else}
																<span class={getValueClass(subValue)}>{formatValue(subValue)}</span>
															{/if}
														</div>

														{#if isExpanded(`${path}.${subKey}`) && typeof subValue === 'object' && subValue !== null}
															<div class="ml-6 border-l border-gray-300 pl-4 dark:border-gray-600">
																<!-- Recursive rendering for nested objects/arrays would go here -->
																<svelte:self
																	data={subValue}
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
														{/if}
													</div>
												{/if}
											{/each}
										{/if}
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
			</div>
		{/if}
	{/if}
</div>

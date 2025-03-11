<!-- 
  CLIENT-SIDE COMPONENT
  
  This component renders a list of URLs related to a company.
  It displays each URL as a card with title, type, and description.
-->
<script lang="ts">
	// Props - URLs data passed from the parent
	export let relatedUrls: any[] = [];
</script>

{#if relatedUrls && relatedUrls.length > 0}
	<div class="mb-8">
		<h2 class="mb-4 text-2xl font-semibold">Related URLs</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each relatedUrls as url}
				<a
					href={url.url}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex items-start">
						<div class="flex-grow">
							<h3 class="font-medium text-blue-600">{url.title || url.url}</h3>
							{#if url.typeLink}
								<span class="mt-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
									{url.typeLink}
								</span>
							{/if}
							{#if url.description}
								<p class="mt-2 text-sm text-gray-600">{url.description}</p>
							{/if}
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-gray-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				</a>
			{/each}
		</div>
	</div>
{/if}

<!-- 
  CompanyExternalLinks.svelte
  
  This component renders the external links for a company (website, social media, etc.)
  It processes the relatedUrls array from the company data and displays appropriate icons.
-->
<script lang="ts">
	import type { EnhancedCompanyData, RelatedUrl } from '../../types';

	// Props
	export let company: EnhancedCompanyData;

	// Define link types and their icons
	const linkTypes: Record<string, { label: string; icon: string }> = {
		website: {
			label: 'Website',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
				</svg>`
		},
		github: {
			label: 'GitHub',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>`
		},
		linkedin: {
			label: 'LinkedIn',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
				</svg>`
		},
		twitter: {
			label: 'X / Twitter',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
				</svg>`
		},
		crunchbase: {
			label: 'Crunchbase',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M21 2H3a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zM10.88 14.07l-3.13 1.3v-2.93L10.88 14.07zM7.75 9.39v2.93L10.88 11 7.75 9.39zm9.5 5.98l-3.13-1.3 3.13-1.63V12.5l-5.25 2.63V16.2L17.25 19v-3.63zm0-5.98L12 12.5v1.07l5.25-2.63V8.44z"/>
				</svg>`
		},
		pitchbook: {
			label: 'PitchBook',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h6v2h-2v10z"/>
				</svg>`
		},
		careers: {
			label: 'Careers',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
					<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
				</svg>`
		}
	};

	// Define the type for our processed links
	type ProcessedLinks = {
		website: string | null;
		github: string | null;
		linkedin: string | null;
		twitter: string | null;
		crunchbase: string | null;
		pitchbook: string | null;
		careers: string | null;
	};

	// Process related URLs to determine which links to show
	$: processedLinks = processRelatedUrls(company.relatedUrls || []);

	// Function to process related URLs and categorize them
	function processRelatedUrls(urls: RelatedUrl[]): ProcessedLinks {
		const links: ProcessedLinks = {
			website: null,
			github: null,
			linkedin: null,
			twitter: null,
			crunchbase: null,
			pitchbook: null,
			careers: null
		};

		// Process each URL and categorize it
		urls.forEach((url) => {
			const urlObj = new URL(url.url);
			const hostname = urlObj.hostname.toLowerCase();

			if (
				url.type === 'website' ||
				hostname.includes('www.') ||
				(!hostname.includes('github') &&
					!hostname.includes('linkedin') &&
					!hostname.includes('twitter') &&
					!hostname.includes('x.com') &&
					!hostname.includes('crunchbase') &&
					!hostname.includes('pitchbook'))
			) {
				links.website = url.url;
			} else if (hostname.includes('github')) {
				links.github = url.url;
			} else if (hostname.includes('linkedin')) {
				links.linkedin = url.url;
			} else if (hostname.includes('twitter') || hostname.includes('x.com')) {
				links.twitter = url.url;
			} else if (hostname.includes('crunchbase')) {
				links.crunchbase = url.url;
			} else if (hostname.includes('pitchbook')) {
				links.pitchbook = url.url;
			} else if (
				url.type === 'careers' ||
				hostname.includes('jobs') ||
				hostname.includes('careers') ||
				url.url.includes('/careers')
			) {
				links.careers = url.url;
			}
		});

		return links;
	}
</script>

<div class="flex flex-wrap gap-3">
	{#each Object.entries(processedLinks) as [type, url]}
		{#if url && linkTypes[type]}
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
				title={linkTypes[type].label}
			>
				{@html linkTypes[type].icon}
				<span class="ml-1.5">{linkTypes[type].label}</span>
			</a>
		{/if}
	{/each}
</div>

<!-- 
  News.svelte
  
  This component renders the News tab content for the company detail page.
  It includes recent news articles, press releases, and media coverage.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';
	import { formatDate } from '$lib/utils/formatters';

	// Props
	// The company prop is required for type-checking but not currently used within the component
	// svelte-ignore export_let_unused
	export let company: EnhancedCompanyData;

	// Placeholder news data - in a real implementation, this would come from the company data or an API
	const newsArticles = [
		{
			title: 'Company Announces New Cloud Platform for Enterprise Customers',
			source: 'Tech News Daily',
			date: '2023-11-15',
			summary:
				'The company unveiled its next-generation cloud platform designed specifically for enterprise customers, featuring enhanced security and scalability options.',
			url: '#',
			image: '/images/placeholders/no-news.svg',
			category: 'Product Launch'
		},
		{
			title: 'Q3 Earnings Exceed Analyst Expectations',
			source: 'Financial Times',
			date: '2023-10-28',
			summary:
				'The company reported strong Q3 earnings, with revenue growth of 18% year-over-year, exceeding analyst expectations by 5%.',
			url: '#',
			image: '/images/placeholders/no-news.svg',
			category: 'Financial'
		},
		{
			title: 'Strategic Partnership Announced with Leading AI Research Lab',
			source: 'AI Insider',
			date: '2023-09-12',
			summary:
				"A new strategic partnership was announced with a leading AI research lab to accelerate the development of machine learning capabilities in the company's products.",
			url: '#',
			image: '/images/placeholders/no-news.svg',
			category: 'Partnership'
		},
		{
			title: 'Company Expands Operations in Asia-Pacific Region',
			source: 'Global Business Review',
			date: '2023-08-05',
			summary:
				'The company announced a significant expansion of its operations in the Asia-Pacific region, including a new regional headquarters in Singapore.',
			url: '#',
			image: '/images/placeholders/no-news.svg',
			category: 'Expansion'
		},
		{
			title: 'New Chief Technology Officer Appointed',
			source: 'Business Wire',
			date: '2023-07-20',
			summary:
				"The company announced the appointment of a new Chief Technology Officer, who will lead the company's technology strategy and innovation initiatives.",
			url: '#',
			image: '/images/placeholders/no-news.svg',
			category: 'Leadership'
		}
	];

	// Placeholder press releases
	const pressReleases = [
		{
			title: 'Company Announces Acquisition of Data Analytics Startup',
			date: '2023-11-02',
			summary:
				"The acquisition will strengthen the company's data analytics capabilities and expand its product offerings in the business intelligence market.",
			url: '#'
		},
		{
			title: 'Company Launches Sustainability Initiative',
			date: '2023-10-10',
			summary:
				'The company announced a comprehensive sustainability initiative aimed at reducing its carbon footprint and promoting environmental responsibility.',
			url: '#'
		},
		{
			title: 'Annual Developer Conference Dates Announced',
			date: '2023-09-05',
			summary:
				"The company's annual developer conference will be held on March 15-17, 2024, featuring product announcements and technical sessions.",
			url: '#'
		}
	];

	// Handle image load errors
	function handleImageError(event: Event) {
		const imgElement = event.target as HTMLImageElement;
		imgElement.src = '/images/placeholders/no-news.svg';
	}

	// Filter news by category
	let selectedCategory = 'All';
	const categories = [
		'All',
		'Product Launch',
		'Financial',
		'Partnership',
		'Expansion',
		'Leadership'
	];

	$: filteredNews =
		selectedCategory === 'All'
			? newsArticles
			: newsArticles.filter((article) => article.category === selectedCategory);
</script>

<div class="space-y-8">
	<!-- News Overview -->
	<section>
		<div class="mb-6 flex flex-wrap items-center justify-between">
			<h2 class="text-2xl font-bold">Recent News</h2>
			<div class="mt-2 flex flex-wrap gap-2 sm:mt-0">
				{#each categories as category}
					<button
						class="rounded-full px-3 py-1 text-sm font-medium {selectedCategory === category
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
						on:click={() => (selectedCategory = category)}
					>
						{category}
					</button>
				{/each}
			</div>
		</div>

		<!-- News Articles -->
		<div class="space-y-6">
			{#each filteredNews as article}
				<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
					<div class="flex flex-col md:flex-row">
						<div class="h-48 w-full overflow-hidden bg-gray-200 md:h-auto md:w-1/3">
							<img
								src={article.image}
								alt={article.title}
								class="h-full w-full object-cover"
								on:error={handleImageError}
							/>
						</div>
						<div class="flex flex-1 flex-col p-6">
							<div class="mb-2 flex items-center">
								<span
									class="mr-3 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
								>
									{article.category}
								</span>
								<span class="text-sm text-gray-500">{formatDate(new Date(article.date))}</span>
							</div>
							<h3 class="mb-2 text-xl font-bold">
								<a href={article.url} class="hover:text-blue-600">{article.title}</a>
							</h3>
							<p class="mb-4 flex-1 text-gray-600">{article.summary}</p>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-500">Source: {article.source}</span>
								<a
									href={article.url}
									class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
								>
									Read more
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="ml-1 h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Press Releases -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Press Releases</h2>
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<ul class="divide-y divide-gray-200">
				{#each pressReleases as release}
					<li class="p-6">
						<div class="mb-1 text-sm text-gray-500">{formatDate(new Date(release.date))}</div>
						<h3 class="mb-2 text-lg font-semibold">
							<a href={release.url} class="hover:text-blue-600">{release.title}</a>
						</h3>
						<p class="mb-3 text-gray-600">{release.summary}</p>
						<a
							href={release.url}
							class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							Read full release
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="ml-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Media Coverage Chart Placeholder -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Media Coverage Trends</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="h-64 w-full bg-gray-50 p-4">
				<div class="flex h-full flex-col items-center justify-center">
					<p class="text-gray-500">Media coverage trends chart will be implemented here</p>
				</div>
			</div>
		</div>
	</section>
</div>

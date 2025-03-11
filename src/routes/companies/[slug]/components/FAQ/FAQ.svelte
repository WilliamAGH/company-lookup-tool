<!-- 
  FAQ.svelte
  
  This component renders the FAQ tab content for the company detail page.
  It includes frequently asked questions about the company, organized by category.
-->
<script lang="ts">
	import type { EnhancedCompanyData } from '../../types';

	// Props
	export let company: EnhancedCompanyData;

	// Placeholder FAQ data - in a real implementation, this would come from the company data
	const faqCategories = [
		{
			name: 'Company Overview',
			questions: [
				{
					question: 'What does the company do?',
					answer:
						'The company provides enterprise software solutions, cloud services, and hardware products for businesses of all sizes. Our main focus is on helping organizations digitally transform their operations through innovative technology solutions.'
				},
				{
					question: 'When was the company founded?',
					answer:
						'The company was founded in 2005 by a team of technology entrepreneurs with a vision to revolutionize how businesses leverage technology for growth and innovation.'
				},
				{
					question: 'Where is the company headquartered?',
					answer:
						'The company is headquartered in San Francisco, California, with regional offices across North America, Europe, Asia, and Australia.'
				},
				{
					question: 'How many employees does the company have?',
					answer:
						'As of the most recent fiscal year, the company employs approximately 5,000 people globally across various departments including engineering, sales, marketing, and customer support.'
				}
			]
		},
		{
			name: 'Products and Services',
			questions: [
				{
					question: 'What are the main products offered by the company?',
					answer:
						'The company offers a comprehensive suite of products including cloud computing platforms, data analytics solutions, security software, and enterprise hardware devices. Our flagship product is our Enterprise Cloud Platform, which serves as the foundation for many of our other offerings.'
				},
				{
					question: 'Does the company offer solutions for small businesses?',
					answer:
						'Yes, while we have enterprise-grade solutions, we also offer scaled versions of our products specifically designed for small and medium-sized businesses, with pricing and features tailored to their needs.'
				},
				{
					question: 'How does the company handle product support?',
					answer:
						'We provide 24/7 customer support through multiple channels including phone, email, and live chat. Enterprise customers also receive dedicated account managers and technical support specialists.'
				},
				{
					question: 'Are there free trials available for the products?',
					answer:
						'Yes, we offer 30-day free trials for most of our software products and cloud services, allowing potential customers to evaluate the solutions before making a purchase decision.'
				}
			]
		},
		{
			name: 'Financial Information',
			questions: [
				{
					question: 'Is the company publicly traded?',
					answer:
						'Yes, the company is publicly traded on the NASDAQ stock exchange under the ticker symbol "TECH" (note: this is a placeholder).'
				},
				{
					question: "What is the company's revenue model?",
					answer:
						'Our revenue comes primarily from subscription-based software services, cloud platform usage fees, hardware sales, and professional services. The majority of our revenue is recurring in nature through multi-year contracts.'
				},
				{
					question: 'Does the company pay dividends?',
					answer:
						'The company currently reinvests profits into growth initiatives and strategic acquisitions rather than paying dividends. However, our board regularly reviews our capital allocation strategy.'
				},
				{
					question: "How can I access the company's financial reports?",
					answer:
						'All quarterly and annual financial reports, as well as investor presentations, are available in the Investor Relations section of our corporate website. We also file regular reports with the SEC.'
				}
			]
		}
	];

	// State for expanded questions
	let expandedQuestions = new Set();

	// Toggle question expansion
	function toggleQuestion(categoryIndex: number, questionIndex: number) {
		const key = `${categoryIndex}-${questionIndex}`;
		if (expandedQuestions.has(key)) {
			expandedQuestions.delete(key);
		} else {
			expandedQuestions.add(key);
		}
		expandedQuestions = expandedQuestions; // Trigger reactivity
	}

	// Check if a question is expanded
	function isExpanded(categoryIndex: number, questionIndex: number): boolean {
		return expandedQuestions.has(`${categoryIndex}-${questionIndex}`);
	}
</script>

<div class="space-y-8">
	<!-- FAQ Introduction -->
	<section>
		<h2 class="mb-4 text-2xl font-bold">Frequently Asked Questions</h2>
		<p class="mb-6 text-gray-600">
			Common questions about {company.name || 'the company'}, its products, services, and
			operations.
		</p>
	</section>

	<!-- FAQ Categories -->
	{#each faqCategories as category, categoryIndex}
		<section>
			<h3 class="mb-4 text-xl font-semibold">{category.name}</h3>
			<div class="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				{#each category.questions as question, questionIndex}
					<div class="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
						<button
							class="flex w-full items-start justify-between text-left"
							on:click={() => toggleQuestion(categoryIndex, questionIndex)}
						>
							<h4 class="cursor-pointer text-lg font-medium">{question.question}</h4>
							<span class="ml-4 flex-shrink-0 cursor-pointer">
								<svg
									class="h-5 w-5 transform text-gray-500 transition-transform {isExpanded(
										categoryIndex,
										questionIndex
									)
										? 'rotate-180'
										: ''}"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						</button>
						{#if isExpanded(categoryIndex, questionIndex)}
							<div class="mt-4 text-gray-600">
								<p>{question.answer}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}

	<!-- Additional Resources -->
	<section>
		<h3 class="mb-4 text-xl font-semibold">Additional Resources</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<button
				type="button"
				class="flex w-full items-center rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm hover:bg-gray-50"
			>
				<div
					class="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						/>
					</svg>
				</div>
				<div>
					<h4 class="font-medium">Knowledge Base</h4>
					<p class="text-sm text-gray-600">Detailed articles and guides</p>
				</div>
			</button>
			<button
				type="button"
				class="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
			>
				<div
					class="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
						/>
					</svg>
				</div>
				<div>
					<h4 class="font-medium">Community Forums</h4>
					<p class="text-sm text-gray-600">Discussions and user support</p>
				</div>
			</button>
			<button
				type="button"
				class="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
			>
				<div
					class="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div>
					<h4 class="font-medium">Contact Support</h4>
					<p class="text-sm text-gray-600">Get help from our team</p>
				</div>
			</button>
		</div>
	</section>
</div>

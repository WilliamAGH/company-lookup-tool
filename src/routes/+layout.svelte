<script lang="ts">
	import '../app.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { restoreDefaultFavicon } from '$lib/utils/favicon.client';

	let { children } = $props();

	// Track the current page path to detect navigation
	let currentPath = '';

	// Subscribe to page changes to detect navigation away from company pages
	const unsubscribe = page.subscribe(($page) => {
		const newPath = $page.url.pathname;

		// If we're not on a company page (and we were previously on a different page)
		// restore the default favicon
		if (currentPath && !newPath.startsWith('/companies/')) {
			console.log('Navigated away from company page, restoring default favicon');
			restoreDefaultFavicon();
		}

		currentPath = newPath;
	});

	// Clean up subscription on component destroy
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	// On initial mount, ensure default favicon if not on a company page
	onMount(() => {
		if (!currentPath.startsWith('/companies/')) {
			restoreDefaultFavicon();
		}
	});
</script>

<svelte:head>
	<!-- Default favicons for the site, will be preserved/restored when not on company pages -->
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="fixed top-4 right-4 z-50">
	<ThemeToggle />
</div>

{@render children()}

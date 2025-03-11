<script lang="ts">
	import { onMount } from 'svelte';

	// Cookie name
	const colorSchemeCookie = 'color-scheme';

	// State with proper reactivity using Svelte 5 runes
	let colorScheme = $state<App.ColorScheme>('system');
	let actualAppearance = $state<'light' | 'dark'>('light');
	let isBrowser = $state(false);

	// Direct click handler with simplified logic
	function handleClick(event: MouseEvent) {
		// Explicitly prevent default and stop propagation to ensure no interference
		event.preventDefault();
		event.stopPropagation();

		// If currently light (whether from system or explicit setting), go to dark
		// If currently dark (whether from system or explicit setting), go to light
		if (actualAppearance === 'light') {
			colorScheme = 'dark'; // Explicitly set to dark (not system)
		} else {
			colorScheme = 'light'; // Explicitly set to light (not system)
		}

		// Apply changes immediately
		applyThemeChange(colorScheme);
	}

	// Separate function to apply theme after state has been updated
	function applyThemeChange(scheme: App.ColorScheme) {
		if (!isBrowser) return;

		// Update DOM
		document.documentElement.dataset.colorScheme = scheme;

		// Update cookie with more reliable API
		document.cookie = `${colorSchemeCookie}=${scheme}; path=/; max-age=31536000; SameSite=Lax`;

		// Update appearance
		actualAppearance =
			scheme === 'system'
				? window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light'
				: scheme;
	}

	// Reactive effect for colorScheme changes
	$effect(() => {
		if (isBrowser && colorScheme) {
			applyThemeChange(colorScheme);
		}
	});

	onMount(() => {
		// Set browser flag first
		isBrowser = true;

		try {
			// Get scheme from document with error handling
			const docScheme = document.documentElement.dataset.colorScheme as App.ColorScheme;
			if (docScheme) {
				colorScheme = docScheme;
			}

			// Get system preference
			const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (colorScheme === 'system') {
				actualAppearance = systemPrefersDark ? 'dark' : 'light';
			} else {
				actualAppearance = colorScheme;
			}

			// Media query
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleMediaChange = (e: MediaQueryListEvent) => {
				if (colorScheme === 'system') {
					actualAppearance = e.matches ? 'dark' : 'light';
				}
			};

			// Add with safer method
			mediaQuery.addEventListener('change', handleMediaChange);

			return () => {
				mediaQuery.removeEventListener('change', handleMediaChange);
			};
		} catch (error) {
			console.error('Error in theme initialization:', error);
		}
	});
</script>

<button
	type="button"
	aria-label="Toggle theme"
	title="Toggle theme"
	class="bg-surface hover:bg-surface-accent cursor-pointer rounded-full p-2 transition-colors"
	onclick={handleClick}
>
	{#if actualAppearance === 'dark'}
		<!-- Sun icon for dark mode (shows the icon to switch to) -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		</svg>
	{:else}
		<!-- Moon icon for light mode (shows the icon to switch to) -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	{/if}
</button>

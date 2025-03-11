<!--
  Image Component
  
  This component handles displaying images from S3 with proper fallbacks and error handling.
  It works with our existing image utilities to provide a consistent image display experience.
  
  Related modules:
  @link src/lib/utils/imagesS3.client.ts - Client-side image utilities
  @link src/lib/constants/placeholders.ts - Placeholder image definitions
  @link src/lib/utils/imagesS3.server.ts - Server-side S3 utilities
  @link src/lib/utils/imageStorage.client.ts - Additional image storage utilities
  
  Usage example:
  <Image 
    src="/logos/ejj/EjJ4SlcBhPXmGyk0KvHgmHg.png" 
    alt="Logo" 
    width={150} 
    height={150}
    fallback="COMPANY_LOGO" 
  />
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getImageUrl, handleImageError } from '$lib/utils/imagesS3.client';
	import { PLACEHOLDERS } from '$lib/constants/placeholders';
	import './Image.css';

	// Props definition with types
	let {
		src,
		alt = '',
		width = 0,
		height = 0,
		fallback = 'DEFAULT',
		lazy = true,
		class: className = '',
		style = ''
	} = $props<{
		src: string;
		alt?: string;
		width?: number;
		height?: number;
		fallback?: keyof typeof PLACEHOLDERS | string;
		lazy?: boolean;
		class?: string;
		style?: string;
	}>();

	// Internal state with proper reactivity
	let imageUrl = $state(getImageUrl(src, { placeholder: fallback }));
	let hasError = $state(false);
	let imgElement: HTMLImageElement;

	// Process the image URL whenever src or fallback changes
	$effect(() => {
		imageUrl = getImageUrl(src, { placeholder: fallback });
	});

	// Handle error if needed
	function onErrorHandler(e: Event) {
		handleImageError(e, fallback);
		hasError = true;
	}

	// Track when image is loaded successfully
	function onLoadHandler() {
		hasError = false;
	}

	// Debug mounts - consider removing in production
	onMount(() => {
		console.log('Image mounted:', { src, imageUrl });
		return () => {
			console.log('Image unmounted:', { src });
		};
	});
</script>

<!-- The image element -->
<img
	bind:this={imgElement}
	src={imageUrl}
	{alt}
	width={width || undefined}
	height={height || undefined}
	loading={lazy ? 'lazy' : 'eager'}
	onerror={onErrorHandler}
	onload={onLoadHandler}
	class={`${className} ${hasError ? 'image-error' : ''}`}
	{style}
/>

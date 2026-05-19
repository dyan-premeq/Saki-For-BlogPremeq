import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { rehypeCodeBlockFrame } from './src/utils/rehype/codeBlockFrame';
import { transformerFileName } from './src/utils/transformers/fileName';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [rehypeCodeBlockFrame],
		shikiConfig: {
			themes: { light: 'min-light', dark: 'github-dark-default' },
			defaultColor: false,
			wrap: false,
			transformers: [
				transformerFileName({ style: 'v2', hideDot: false }),
				transformerNotationHighlight(),
				transformerNotationWordHighlight(),
				transformerNotationDiff({ matchAlgorithm: 'v3' }),
			],
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Cascadia Code',
			cssVariable: '--font-cascadia-code',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/cascadia-code.woff2'],
						display: 'swap',
					},
				],
			},
		},
	],
});

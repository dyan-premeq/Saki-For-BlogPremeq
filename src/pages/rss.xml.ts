import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../site_config.ts';

export async function GET(context: APIContext) {
	const posts = (await getCollection('blog'))
		.filter((post) => !post.data.isDraft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site ?? new URL('https://example.com'),
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}

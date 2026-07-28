import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site_config.ts';
import { getPostSlug, getVisiblePosts } from '../utils/content';

export async function GET(context: APIContext) {
	const posts = await getVisiblePosts();

	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site ?? new URL(SITE.website),
		items: posts.map((post) => ({
			...post.data,
			link: `/post/${getPostSlug(post)}/`,
		})),
	});
}

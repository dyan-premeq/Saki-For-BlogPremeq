import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { BLOG_CONTENT_DIR } from './content-paths';

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/, {
		message: 'must be an ISO date (YYYY-MM-DD) or UTC timestamp',
	})
	.transform((value, context) => {
		const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
		if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value.slice(0, 10)) {
			context.addIssue({ code: 'custom', message: 'must be a valid calendar date' });
			return z.NEVER;
		}
		return date;
	});

const blog = defineCollection({
	loader: glob({
		base: pathToFileURL(resolve(BLOG_CONTENT_DIR, 'posts')),
		pattern: '*/index.{md,mdx}',
	}),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				description: z.string(),
				pubDate: isoDate,
				updatedDate: isoDate.optional(),
				heroImage: image().optional(),
				isDraft: z.boolean().default(true),
				isFeatured: z.boolean().default(false),
				tags: z.array(z.string().min(1)).optional(),
			})
			.strict(),
});

const about = defineCollection({
	loader: glob({
		base: pathToFileURL(resolve(BLOG_CONTENT_DIR, 'pages')),
		pattern: 'about.{md,mdx}',
	}),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				description: z.string(),
				pubDate: isoDate,
				updatedDate: isoDate.optional(),
				heroImage: image().optional(),
			})
			.strict(),
});

export const collections = { blog, about };

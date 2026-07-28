import { readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { parseDocument } from 'yaml';
import { SITE_CONFIG_PATH } from '../content-paths';
import type { SiteConfig } from '../site_config';

const webUrl = z
	.url()
	.refine((value) => value.startsWith('https://') || value.startsWith('http://'), {
		message: 'must be an HTTP(S) URL',
	});

const publicAsset = z.string().min(1).refine(
	(value) => value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://'),
	{ message: 'must be a root-relative public path or an HTTP(S) URL' },
);

const timezone = z.string().min(1).refine(
	(value) => {
		try {
			new Intl.DateTimeFormat('en', { timeZone: value }).format();
			return true;
		} catch {
			return false;
		}
	},
	{ message: 'must be a valid IANA time zone' },
);

const siteSchema = z
	.object({
		website: webUrl,
		title: z.string().min(1),
		description: z.string(),
		author: z.string().min(1),
		lang: z.string().min(1),
		dir: z.enum(['ltr', 'rtl', 'auto']),
		timezone,
		notice: z.string(),
		avatar: z
			.object({
				src: publicAsset,
				alt: z.string().min(1),
			})
			.strict(),
		homeHero: publicAsset,
		socials: z.array(
			z
				.object({
					name: z.string().min(1),
					href: z.url(),
					icon: z.enum(['mail', 'github', 'x', 'zhihu', 'bilibili', 'rss']).optional(),
					linkTitle: z.string().min(1).optional(),
				})
				.strict(),
		),
	})
	.strict();

export function loadSiteConfig(): SiteConfig {
	let source: string;
	try {
		source = readFileSync(SITE_CONFIG_PATH, 'utf8');
	} catch (error) {
		throw new Error(`Unable to read site configuration at ${SITE_CONFIG_PATH}`, { cause: error });
	}

	const document = parseDocument(source, { uniqueKeys: true });
	if (document.errors.length > 0) {
		throw new Error(
			`Invalid YAML in ${SITE_CONFIG_PATH}:\n${document.errors.map((error) => `- ${error.message}`).join('\n')}`,
		);
	}

	const result = siteSchema.safeParse(document.toJS());
	if (!result.success) {
		const issues = result.error.issues.map((issue) => {
			const path = issue.path.length > 0 ? issue.path.join('.') : '<root>';
			return `- ${path}: ${issue.message}`;
		});
		throw new Error(`Invalid site configuration in ${SITE_CONFIG_PATH}:\n${issues.join('\n')}`);
	}

	return result.data;
}

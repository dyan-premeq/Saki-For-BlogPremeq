export interface SocialLink {
	name: string;
	href: string;
	icon?: 'mail' | 'github' | 'x' | 'zhihu' | 'bilibili' | 'rss';
	linkTitle?: string;
}

export interface SiteConfig {
	website: string;
	title: string;
	description: string;
	author: string;
	lang: string;
	dir: 'ltr' | 'rtl' | 'auto';
	timezone: string;
	notice: string;
	avatar: {
		src: string;
		alt: string;
	};
	homeHero: string;
	socials: SocialLink[];
}

declare const __SAKI_SITE_CONFIG__: SiteConfig;

/** Validated and injected by astro.config.ts before any page code is bundled. */
export const SITE: Readonly<SiteConfig> = Object.freeze(__SAKI_SITE_CONFIG__);

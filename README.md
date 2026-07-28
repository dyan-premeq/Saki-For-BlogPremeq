# 网站引擎仓库 / Saki Website Engine

> **仓库职责：这是网站引擎仓库 `dyan-premeq/Saki-For-BlogPremeq`。** 这里只维护 Astro 代码、样式和组件。个人文章、个人资料、品牌资源与生产发布属于相邻的内容仓库 `~/Projects/blog`；废稿归档不参与开发或发布。

Saki is an Astro 6 static blog engine. It is deliberately usable both with its public example content and with a separate private content checkout. Do not copy personal content into this repository and do not use a submodule or packaged theme to connect the two repositories.

## Repository identity

Every maintenance command checks both `repo-role.json` and the Git `origin` before it runs:

```sh
pnpm check:repo
```

The expected local directory is `~/Projects/saki-astro`, and `origin` must identify `dyan-premeq/Saki-For-BlogPremeq`. Every engine command checks both `repo-role.json` and the Git `origin`; a copied source tree or the draft archive is deliberately rejected.

## Content interface

`BLOG_CONTENT_DIR` selects an external content root. Relative values are resolved from the website engine repository; when unset, the engine uses `example-content/`.

```text
<content-root>/
├── posts/
│   └── <slug>/
│       ├── index.md or index.mdx
│       └── cover.png
├── pages/
│   └── about.md
├── public/
│   ├── favicon.svg
│   └── personal static assets
└── site.yaml
```

Post frontmatter accepts `title`, `description`, `pubDate`, `updatedDate`, `heroImage`, `isDraft`, `isFeatured`, and `tags`. Dates must be quoted ISO dates (`'2026-07-28'`) or UTC timestamps. `isDraft` defaults to `true`, and article images should use a colocated relative path such as `./cover.png`.

`site.yaml` is validated strictly. It must contain:

```yaml
website: https://example.com/
title: Site title
description: Site description
author: Author name
lang: en
dir: ltr
timezone: UTC
notice: Site announcement
avatar:
  src: /avatar.png
  alt: Author avatar
homeHero: /hero.png
socials:
  - name: GitHub
    href: https://github.com/example
    icon: github
    linkTitle: Example on GitHub
```

Unknown configuration or frontmatter fields, malformed dates, missing local images, and missing About content fail validation/build.

## Development and production

Install and verify with the pinned package manager:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

For engine-only development, the example content works without any private checkout. For integrated local writing, point to the content repository and opt into drafts:

```sh
BLOG_CONTENT_DIR=../blog BLOG_INCLUDE_DRAFTS=true pnpm dev
```

Draft inclusion is honored only by the development server. Production builds always exclude drafts from the homepage, archive, static post routes, RSS, and generated sitemap.

The canonical site URL is read from `site.yaml`. Post routes remain `/post/<slug>/`, RSS remains `/rss.xml`, and sitemap generation remains enabled. Cloudflare deployment configuration stays in `wrangler.jsonc`; production deployment is owned by the private content repository workflow.

## Technology

- Astro 6 and strict TypeScript
- Tailwind CSS 4
- Markdown and MDX content collections
- Cloudflare Workers adapter
- pnpm 11.3.0

# Saki

Saki 是一个基于 Astro 6 的静态博客引擎。它既可以使用公开的示例内容独立运行，也可以读取单独检出的私有内容。请勿将个人内容复制到本仓库，也不要使用 Git 子模块或封装主题来连接两个仓库。

## 仓库身份

请在 Git 工作树根目录运行仓库身份检查：

```sh
pnpm check:repo
```

受身份保护的项目脚本会自动执行此检查。检查内容包括：当前目录是否为工作树根目录，以及 `repo-role.json` 与 Git `origin` 是否指向预期仓库。

## 内容接口

`BLOG_CONTENT_DIR` 用于指定外部内容根目录。相对路径以网站引擎仓库为基准解析；未设置时，引擎使用 `example-content/`。

```text
<内容根目录>/
├── posts/
│   └── <slug>/
│       ├── index.md 或 index.mdx
│       └── cover.png
├── pages/
│   └── about.md
├── public/
│   ├── favicon.svg
│   └── 个人静态资源
└── site.yaml
```

文章头部元数据（frontmatter）支持 `title`、`description`、`pubDate`、`updatedDate`、`heroImage`、`isDraft`、`isFeatured` 和 `tags`。日期必须是带引号的 ISO 日期（如 `'2026-07-28'`）或 UTC 时间戳。`isDraft` 默认为 `true`；文章图片应使用同目录下的相对路径，例如 `./cover.png`。

`site.yaml` 会经过严格校验，且必须包含以下字段：

```yaml
website: https://example.com/
title: 网站标题
description: 网站描述
author: 作者名称
lang: en
dir: ltr
timezone: UTC
notice: 网站公告
avatar:
  src: /avatar.png
  alt: 作者头像
homeHero: /hero.png
socials:
  - name: GitHub
    href: https://github.com/example
    icon: github
    linkTitle: GitHub 示例
```

出现未知的配置字段或头部元数据字段、格式错误的日期、缺失的本地图片或缺失的“关于”页面内容时，校验或构建会失败。

## 开发与生产

使用项目锁定的包管理器安装依赖并验证：

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

仅开发引擎时，可以直接使用示例内容，无需检出任何私有内容。需要在本地结合内容仓库写作时，请指定内容仓库并启用草稿：

```sh
BLOG_CONTENT_DIR=../blog BLOG_INCLUDE_DRAFTS=true pnpm dev
```

只有开发服务器会读取草稿开关。生产构建始终会从首页、归档、静态文章路由、RSS 和生成的站点地图中排除草稿。

网站规范 URL 从 `site.yaml` 读取。文章路由保持为 `/post/<slug>/`，RSS 保持为 `/rss.xml`，并继续生成站点地图。Cloudflare 部署配置位于 `wrangler.jsonc`；生产部署由私有内容仓库的工作流负责。

## 技术栈

- Astro 6 / TypeScript
- Tailwind CSS 4
- Markdown / MDX 
- Cloudflare Workers 适配器

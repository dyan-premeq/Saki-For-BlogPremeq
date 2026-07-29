import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { fileURLToPath } from "node:url";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { rehypeCodeBlockFrame } from "./src/utils/rehype/codeBlockFrame";
import { rehypeMarkdownFootnotes } from "./src/utils/rehype/footnotes";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { BLOG_PUBLIC_DIR } from "./src/content-paths";
import { SITE, type SiteConfig } from "./src/config/site";

import cloudflare from "@astrojs/cloudflare";

function normalizeModuleId(id: string) {
  const normalized = id
    .replace(/^\/@fs\//, "")
    .replace(/[?#].*$/, "")
    .replaceAll("\\", "/");

  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

const siteConfigModuleId = normalizeModuleId(
  fileURLToPath(new URL("./src/config/site.ts", import.meta.url)),
);

function embedValidatedSiteConfig(site: SiteConfig) {
  const source = `export const SITE = ${JSON.stringify(site)};\n`;

  return {
    name: "saki:embed-validated-site-config",
    enforce: "pre" as const,
    load(id: string) {
      return normalizeModuleId(id) === siteConfigModuleId ? source : null;
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  publicDir: BLOG_PUBLIC_DIR,
  integrations: [mdx(), sitemap()],

  markdown: {
    rehypePlugins: [rehypeCodeBlockFrame, rehypeMarkdownFootnotes],
    shikiConfig: {
      themes: { light: "min-light", dark: "github-dark-default" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },

  vite: {
    plugins: [embedValidatedSiteConfig(SITE), tailwindcss()],
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Atkinson",
      cssVariable: "--font-atkinson",
      fallbacks: [],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/atkinson-regular.woff"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["./src/assets/fonts/atkinson-bold.woff"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Cascadia Code",
      cssVariable: "--font-cascadia-code",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/cascadia-code.woff2"],
            display: "swap",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/JetBrainsMono-Regular.woff2"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Syne",
      cssVariable: "--font-syne",
      fallbacks: [],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Syne-Regular.woff2"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["./src/assets/fonts/Syne-Bold.woff2"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Tangerine",
      cssVariable: "--font-tangerine",
      fallbacks: [],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Tangerine-Regular.woff2"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["./src/assets/fonts/Tangerine-Bold.woff2"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Liberation Serif",
      cssVariable: "--font-liberation-serif",
      fallbacks: [],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/LiberationSerif-Regular.woff2"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["./src/assets/fonts/LiberationSerif-Bold.woff2"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
  ],

  adapter: cloudflare({
    imageService: "compile",
  }),
});

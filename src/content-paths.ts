import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const ENGINE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const configuredContentDir = process.env.BLOG_CONTENT_DIR?.trim();

/**
 * Relative BLOG_CONTENT_DIR values are resolved from the website engine repository root.
 * This keeps local and CI invocation independent from the caller's current directory.
 */
export const BLOG_CONTENT_DIR = resolve(
  ENGINE_ROOT,
  configuredContentDir || "example-content",
);
export const BLOG_PUBLIC_DIR = resolve(BLOG_CONTENT_DIR, "public");
export const SITE_CONFIG_PATH = resolve(BLOG_CONTENT_DIR, "site.yaml");

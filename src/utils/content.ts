import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

// Drafts are opt-in during `astro dev` only. A production build never includes them,
// even if BLOG_INCLUDE_DRAFTS is accidentally present in its environment.
export const INCLUDE_DRAFTS =
  import.meta.env.DEV &&
  import.meta.env.BLOG_INCLUDE_DRAFTS?.toLowerCase() === "true";

export function getPostSlug(post: BlogPost): string {
  const id = post.id.replaceAll("\\", "/");
  const match = /^(?<slug>[^/]+)(?:\/index)?$/.exec(id);
  if (
    !match?.groups?.slug ||
    match.groups.slug === "." ||
    match.groups.slug === ".."
  ) {
    throw new Error(
      `Invalid post entry id "${post.id}". Expected posts/<slug>/index.{md,mdx}.`,
    );
  }
  return match.groups.slug;
}

export async function getVisiblePosts(): Promise<BlogPost[]> {
  const posts = (await getCollection("blog"))
    .filter((post) => INCLUDE_DRAFTS || !post.data.isDraft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const slugs = new Set<string>();
  for (const post of posts) {
    const slug = getPostSlug(post);
    if (slugs.has(slug)) {
      throw new Error(
        `Duplicate post slug "${slug}" in the configured content directory.`,
      );
    }
    slugs.add(slug);
  }

  return posts;
}

type BlogModule = {
  default: React.ComponentType;
  metadata: BlogPostMeta;
};

export type BlogPostMeta = {
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
};

export type BlogPostSummary = BlogPostMeta & {
  slug: string;
};

const postModules = {
  "zero-hallucination-prompt-patterns": () =>
    import("@/content/blog/zero-hallucination-prompt-patterns.mdx"),
  "feasibility-guard-design": () => import("@/content/blog/feasibility-guard-design.mdx"),
  "byok-client-side-ai": () => import("@/content/blog/byok-client-side-ai.mdx"),
} satisfies Record<string, () => Promise<BlogModule>>;

export const blogPostSlugs = Object.keys(postModules) as Array<keyof typeof postModules>;

export async function getAllBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await Promise.all(
    blogPostSlugs.map(async (slug) => {
      const postModule = await postModules[slug]();

      return {
        slug,
        ...postModule.metadata,
      };
    }),
  );

  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getBlogPost(slug: string) {
  const loader = postModules[slug as keyof typeof postModules];

  if (!loader) {
    return null;
  }

  const postModule = await loader();

  return {
    slug,
    metadata: postModule.metadata,
    Content: postModule.default,
  };
}

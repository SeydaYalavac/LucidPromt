declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXContent: ComponentType;

  export const metadata: {
    title: string;
    description: string;
    publishedAt: string;
    readingTime: string;
    tags: string[];
  };

  export default MDXContent;
}

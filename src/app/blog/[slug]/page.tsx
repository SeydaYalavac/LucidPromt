import Link from "next/link";
import { notFound } from "next/navigation";

import { getBlogPost, blogPostSlugs } from "@/lib/blog";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return blogPostSlugs.map((slug) => ({ slug }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { Content, metadata } = post;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-border bg-panel-strong/90 p-4 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-6">
        <div className="mb-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-3 text-center text-sm text-sky-100">
          Reklam Slot: Header Banner 970x90
        </div>

        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
              Teknik Makale
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {metadata.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              {metadata.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {metadata.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="rounded-full border border-border px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/40"
            >
              Tüm yazılar
            </Link>
            <Link
              href="/forum"
              className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              Forum tartışmalarına git
            </Link>
          </div>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
          <article className="rounded-[24px] border border-border bg-panel p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>{metadata.publishedAt}</span>
              <span>{metadata.readingTime}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <Content />
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 p-4 text-center text-sm text-sky-100">
              Reklam Slot: Article Footer Banner
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-sm font-medium text-sky-200">Makale akışı</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>Forum konularına bağlanacak vaka yazıları için hazır.</p>
                <p>MDX ile kod blokları ve interaktif bileşen eklenebilir.</p>
                <p>İçerik doğrudan Git tabanlı dosyalardan yayınlanır.</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-border bg-slate-950/40 p-5 text-center text-sm text-slate-400">
              Reklam Slot: Sidebar 300x600
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

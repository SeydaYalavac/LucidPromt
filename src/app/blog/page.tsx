import Link from "next/link";

import { getAllBlogPosts } from "@/lib/blog";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-border bg-panel-strong/90 p-4 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-6">
        <div className="mb-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-3 text-center text-sm text-sky-100">
          Reklam Slot: Header Banner 970x90
        </div>

        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
              Teknik Bilgi Merkezi
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              MDX tabanlı blog ve derin AI rehberleri
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Yazılar Git tabanlı içerik olarak render ediliyor; veritabanını
              yormadan SEO ve uzun oturum süresi için hazır.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-border px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/40"
            >
              Optimizer&apos;a dön
            </Link>
            <Link
              href="/forum"
              className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              Forumu aç
            </Link>
          </div>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={post.slug}>
                <article className="rounded-2xl border border-border bg-slate-950/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {post.publishedAt}
                    </p>
                    <span className="text-xs text-sky-200">{post.readingTime}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    <Link href={`/blog/${post.slug}`} className="transition hover:text-sky-200">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {post.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2.5 py-1 text-xs text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>

                {(index + 1) % 2 === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 p-4 text-center text-sm text-sky-100">
                    Reklam Slot: Blog In-Feed Banner
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-sm font-medium text-sky-200">İçerik temaları</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["hallucination", "guardrails", "byok", "cost", "frontend"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-slate-300"
                    >
                      #{tag}
                    </span>
                  ),
                )}
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

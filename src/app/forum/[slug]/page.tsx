import Link from "next/link";
import { notFound } from "next/navigation";

import { ForumReplyCard } from "@/components/forum/ForumReplyCard";
import { getForumThreadBySlug } from "@/lib/forum/seedData";

type ForumDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ForumDetailPage({ params }: ForumDetailPageProps) {
  const { slug } = await params;
  const thread = getForumThreadBySlug(slug);

  if (!thread) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-border bg-panel-strong/90 p-4 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-6">
        <div className="mb-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-3 text-center text-sm text-sky-100">
          Reklam Slot: Header Banner 970x90
        </div>

        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
              Thread Detail · {thread.modelTag}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {thread.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300">{thread.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
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
              href="/forum"
              className="rounded-full border border-border px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/40"
            >
              Tüm konular
            </Link>
            <Link
              href={`/?fork=${thread.slug}`}
              className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              Bunu kopyala ve düzenle
            </Link>
          </div>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-300">
                  <p>
                    @{thread.author} · {thread.createdAt}
                  </p>
                  <p className="mt-1 text-sky-200">
                    {thread.votes} oy · {thread.replies.length} yanıt
                  </p>
                </div>
                {thread.solved ? (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    Çözüm işaretlenmiş
                  </span>
                ) : null}
              </div>
            </div>

            {thread.replies.map((reply, index) => (
              <div key={reply.id}>
                <ForumReplyCard reply={reply} />
                {(index + 1) % 2 === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 p-4 text-center text-sm text-sky-100">
                    Reklam Slot: Forum In-Feed Banner
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-sm font-medium text-sky-200">Fork önizlemesi</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-slate-300">
                {thread.forkPrompt}
              </pre>
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

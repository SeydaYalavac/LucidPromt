import Link from "next/link";

import type { ForumThread } from "@/lib/forum/seedData";

type ForumThreadCardProps = {
  thread: ForumThread;
  compact?: boolean;
};

export function ForumThreadCard({
  thread,
  compact = false,
}: ForumThreadCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-slate-950/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          {thread.modelTag}
        </p>
        <span className="text-xs text-sky-200">
          {thread.votes} oy - {thread.replies.length} yanıt
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">
        <Link href={`/forum/${thread.slug}`} className="transition hover:text-sky-200">
          {thread.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {compact ? thread.excerpt : thread.body}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {thread.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-slate-300"
          >
            #{tag}
          </span>
        ))}
        {thread.solved ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
            Çözüm var
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          @{thread.author} · {thread.createdAt}
        </p>
        <Link
          href={`/?fork=${thread.slug}`}
          className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:bg-sky-400/20"
        >
          Bunu kopyala ve düzenle
        </Link>
      </div>
    </article>
  );
}

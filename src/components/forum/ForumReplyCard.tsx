import type { ForumReply } from "@/lib/forum/seedData";

type ForumReplyCardProps = {
  reply: ForumReply;
};

export function ForumReplyCard({ reply }: ForumReplyCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-slate-950/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-white">@{reply.author}</p>
          <p className="text-xs text-slate-500">
            {reply.role} · {reply.createdAt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-200">{reply.votes} oy</span>
          {reply.isSolution ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
              Çözüm
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-300">{reply.body}</p>
    </article>
  );
}

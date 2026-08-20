import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { ForumThreadCard } from "@/components/forum/ForumThreadCard";
import { forumThreads as seedThreads } from "@/lib/forum/seedData";
import { CreateThreadButton } from "@/components/forum/CreateThreadButton";

export const revalidate = 0; // Disable static rendering for this page to always fetch fresh data

export default async function ForumPage() {
  let activeThreads = seedThreads;
  let totalThreads = activeThreads.length;
  let totalReplies = activeThreads.reduce((sum, t) => sum + t.replies.length, 0);
  let solvedCount = activeThreads.filter((t) => t.solved).length;

  if (hasSupabaseEnv()) {
    const supabase = await getSupabaseServerClient();
    
    // Fetch live threads
    const { data: threadsData } = await supabase
      .from("threads")
      .select("*, replies(id), profiles(username, avatar_url)")
      .order("created_at", { ascending: false });
      
    if (threadsData && threadsData.length > 0) {
      // Map to the required props shape
      activeThreads = threadsData.map((t) => {
        return {
          id: t.id,
          title: t.title,
          excerpt: t.body.substring(0, 150) + "...",
          // @ts-expect-error
          author: t.profiles?.username || "Anonim",
          slug: t.slug,
          votes: t.upvote_count || 0,
          modelTag: t.tags?.[0] || "genel",
          replies: t.replies || [],
          solved: !!t.resolved_reply_id,
          body: t.body,
          tags: t.tags || [],
          forkPrompt: t.body,
          createdAt: t.created_at,
        };
      });
      
      totalThreads = activeThreads.length;
      totalReplies = activeThreads.reduce((sum, t) => sum + t.replies.length, 0);
      solvedCount = activeThreads.filter((t) => t.solved).length;
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-border bg-panel-strong/90 p-4 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-6">
        <div className="mb-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-3 text-center text-sm text-sky-100">
          Reklam Slot: Header Banner 970x90
        </div>

        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
              Geliştirici Forumu ve Prompt Hub
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              Tartışmalar, çözümler ve fork akışı tek yerde
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              StackOverflow benzeri konu listesi, çözüm işaretleri ve Modül A
              editörüne dönen tek tık fork deneyimi hazır.
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
              href="/blog"
              className="rounded-full border border-border px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/40"
            >
              Blog&apos;a git
            </Link>
            <CreateThreadButton />
          </div>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {activeThreads.map((thread, index) => (
              <div key={thread.id}>
                <ForumThreadCard thread={thread} />
                {(index + 1) % 2 === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 p-4 text-center text-sm text-sky-100">
                    Reklam Slot: Forum In-Feed Banner
                  </div>
                ) : null}
              </div>
            ))}
            
            {activeThreads.length === 0 && (
              <div className="rounded-2xl border border-border bg-slate-950/40 p-8 text-center text-slate-400">
                Henüz hiç konu açılmamış. İlk konuyu sen aç!
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-sm font-medium text-sky-200">Filtreler</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["gemini", "claude", "gpt", "rag", "safety", "scoring"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-sm font-medium text-sky-200">Topluluk sinyalleri</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>Toplam konu: {totalThreads}</p>
                <p>Çözülmüş konu: {solvedCount}</p>
                <p>Toplam yanıt: {totalReplies}</p>
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

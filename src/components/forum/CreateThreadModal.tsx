"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateThreadModal({ isOpen, onClose, onSuccess }: CreateThreadModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !body) {
      setError("Başlık ve içerik zorunludur.");
      return;
    }

    if (!token) {
      setError("Lütfen bot olmadığınızı doğrulayın.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Turnstile verification
      const verifyRes = await fetch("/api/turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error("Bot doğrulaması başarısız oldu.");
      }

      if (!hasSupabaseEnv()) {
        throw new Error("Supabase bağlantısı yapılandırılmamış.");
      }

      const supabase = getSupabaseBrowserClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("Konu açmak için giriş yapmalısınız.");
      }

      const tagArray = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const { error: insertError } = await supabase.from("threads").insert([{
        title,
        body,
        slug: `${slug}-${Date.now()}`,
        tags: tagArray,
        author_id: sessionData.session.user.id,
      }]);

      if (insertError) {
        throw new Error("Konu oluşturulurken veritabanı hatası oluştu.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Bilinmeyen bir hata oluştu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Yeni Konu Aç</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Başlık</label>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-slate-900/50 p-2.5 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Konu başlığı..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">İçerik</label>
            <textarea
              className="min-h-32 w-full resize-none rounded-lg border border-border bg-slate-900/50 p-2.5 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Sorununuzu veya paylaşmak istediğiniz prompt'u detaylandırın..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Etiketler (virgülle ayırın)</label>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-slate-900/50 p-2.5 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="gpt, rag, safety..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="mt-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onSuccess={(t) => setToken(t)}
              options={{ theme: "dark" }}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-50"
            >
              {isSubmitting ? "Gönderiliyor..." : "Konu Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

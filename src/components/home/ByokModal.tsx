"use client";

import { useEffect, useState } from "react";
import { loadKeys, saveKeys, clearKeys, ApiKeys } from "@/lib/byok";

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ByokModal({ isOpen, onClose }: ByokModalProps) {
  const [keys, setKeys] = useState<ApiKeys>({ gemini: "", groq: "" });

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKeys(loadKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveKeys(keys);
    onClose();
  };

  const handleClear = () => {
    clearKeys();
    setKeys({ gemini: "", groq: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">API Anahtarları (BYOK)</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <p className="mb-6 text-sm text-slate-300">
          Sıfır maliyetli kullanım için kendi API anahtarlarınızı getirin.
          Anahtarlarınız sadece bu tarayıcıda şifrelenerek saklanır, sunucuya iletilmez.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Google Gemini API Anahtarı
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              className="w-full rounded-lg border border-border bg-slate-900/50 p-2.5 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={keys.gemini || ""}
              onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Groq API Anahtarı
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              className="w-full rounded-lg border border-border bg-slate-900/50 p-2.5 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={keys.groq || ""}
              onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleClear}
            className="rounded-lg border border-red-900/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
          >
            Temizle
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

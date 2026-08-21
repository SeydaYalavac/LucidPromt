"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import type { NewsVisual } from "@/types/trends";

export function SourcedNewsVisual({ visual, featured = false }: { visual?: NewsVisual | null; featured?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!visual || failedUrl === visual.image_url) return null;

  return <figure className="editorial-card overflow-hidden rounded-xl border">
    <div className={`overflow-hidden bg-[#111114] ${featured ? "aspect-[16/7]" : "aspect-[16/9]"}`}>
      {/* The rights-checked adapter can return multiple media hosts, so this intentionally avoids a static Next.js host allowlist. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visual.image_url}
        alt={visual.alt_text}
        title={visual.title}
        width={visual.width}
        height={visual.height}
        loading={featured ? "eager" : "lazy"}
        fetchPriority={featured ? "high" : "auto"}
        onError={() => setFailedUrl(visual.image_url)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
      />
    </div>
    <figcaption className="border-t border-white/[0.08] px-3 py-2">
      <p className="text-[10px] leading-4 text-white/60">{visual.title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">
      <a href={visual.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        {visual.source_name}<ExternalLink size={10} aria-hidden="true" />
      </a>
      <span aria-hidden="true">·</span>
      <span>{visual.creator_name}</span>
      <span aria-hidden="true">·</span>
      <a href={visual.license_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{visual.license_name}</a>
      </div>
    </figcaption>
  </figure>;
}

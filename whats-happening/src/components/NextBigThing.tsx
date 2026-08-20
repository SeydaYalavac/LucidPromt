"use client";

import { useState } from "react";
import { ArrowUpRight, ThumbsUp, ThumbsDown } from "lucide-react";

const predictions = [
  { id: "p1", title: "Quantum Computing", likelihood: 72, growth: 74, regions: "US · UK · Germany" },
  { id: "p2", title: "Neuromorphic Chips", likelihood: 64, growth: 58, regions: "Japan · South Korea" },
  { id: "p3", title: "Direct Air Capture", likelihood: 81, growth: 92, regions: "Europe · Canada" },
];

export function NextBigThing() {
  const [votes, setVotes] = useState<Record<string, boolean>>({});

  return (
    <section className="w-full py-32 bg-[#0B0B0D]">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-[clamp(40px,5vw,80px)] font-bold tracking-tighter text-white leading-none">
          WHAT&apos;S NEXT?
        </h2>
        <p className="mt-4 text-xl text-[#8B8B93]">Signals that may become tomorrow&apos;s biggest stories.</p>
        
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {predictions.map((item) => {
            const hasVoted = votes[item.id] !== undefined;
            return (
              <div key={item.id} className="flex flex-col justify-between rounded-3xl border border-white/5 bg-[#111114] p-8 hover:bg-[#17171B] transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 bg-[#06b6d4]/20 w-full">
                  <div className="h-full bg-[#06b6d4]" style={{ width: `${item.likelihood}%` }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-white">{item.likelihood}%</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">Likely to break out</span>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1 text-[#8b5cf6]">
                      <ArrowUpRight size={16} /> +{item.growth}%
                    </span>
                    <span className="text-[#8B8B93]">{item.regions}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  {!hasVoted ? (
                    <div className="space-y-4">
                      <p className="text-sm text-center text-[#8B8B93]">Will this become a global trend?</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setVotes(p => ({ ...p, [item.id]: true }))}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 hover:bg-white/10 transition-colors text-white font-semibold"
                        >
                          <ThumbsUp size={16} /> YES
                        </button>
                        <button 
                          onClick={() => setVotes(p => ({ ...p, [item.id]: false }))}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 hover:bg-white/10 transition-colors text-white font-semibold"
                        >
                          <ThumbsDown size={16} /> NO
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-lg font-bold text-white">Your prediction has been recorded. 🔥</p>
                      <p className="text-sm text-[#8B8B93]">{item.likelihood}% of people agree with you.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

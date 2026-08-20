"use client";

import { useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const interests = ["AI", "Biology", "Space", "Gaming", "Movies", "Finance", "Sports", "Culture", "Design", "Startups"];

export function ForYou() {
  const [selected, setSelected] = useState(["AI", "Biology", "Space"]);

  return (
    <section className="w-full py-32 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-[clamp(40px,5vw,80px)] font-bold tracking-tighter text-white leading-none">
          YOUR WORLD
        </h2>
        
        <div className="mt-8 flex flex-wrap gap-3">
          {interests.map(interest => (
            <button
              key={interest}
              onClick={() => {
                if (selected.includes(interest)) setSelected(selected.filter(i => i !== interest));
                else setSelected([...selected, interest]);
              }}
              className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-all ${
                selected.includes(interest) 
                  ? "border-white bg-white text-black" 
                  : "border-white/10 bg-white/5 text-[#8B8B93] hover:text-white"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {selected.includes("Biology") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-white/5 bg-[#111114] p-8">
              <div className="flex items-center gap-2 text-[#a78bfa] font-bold uppercase tracking-widest text-xs mb-4">
                <Sparkles size={16} /> Biology
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight">A genetics breakthrough is gaining attention.</h3>
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="flex items-center gap-2 text-[#a78bfa] font-bold"><TrendingUp size={16} /> +126%</span>
                <span className="text-sm text-[#8B8B93]">Matches Biology + AI</span>
              </div>
            </motion.div>
          )}

          {selected.includes("AI") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-white/5 bg-[#111114] p-8">
              <div className="flex items-center gap-2 text-[#06b6d4] font-bold uppercase tracking-widest text-xs mb-4">
                <Sparkles size={16} /> AI
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight">A new model is spreading rapidly among developers.</h3>
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="flex items-center gap-2 text-[#06b6d4] font-bold"><TrendingUp size={16} /> +289%</span>
                <span className="text-sm text-[#8B8B93]">Trending in your interests</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

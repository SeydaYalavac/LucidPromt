"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlobalNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500",
        isScrolled
          ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-12">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-white uppercase">
          What&apos;s Happening
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {["World", "Trending", "Explore", "Map"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs uppercase tracking-widest text-[#8B8B93] transition-colors hover:text-white"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-[#8B8B93] transition-colors hover:text-white group">
          <Search size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium uppercase tracking-wider hidden sm:block">Search</span>
        </button>
        <button className="text-xs uppercase tracking-widest text-[#8B8B93] transition-colors hover:text-white">
          Sign In
        </button>
        <button
          type="button"
          aria-label="Open profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <User size={14} className="text-white" />
        </button>
      </div>
    </motion.header>
  );
}

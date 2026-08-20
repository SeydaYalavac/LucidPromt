"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Search, User } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthSession";

type GlobalNavbarProps = {
  showPrimaryAuthAction?: boolean;
};

const navigationItems = [
  { label: "World", href: "/#world" },
  { label: "Trending", href: "/#trending" },
  { label: "Explore", href: "/#explore" },
  { label: "Map", href: "/#map" },
  { label: "Pricing", href: "/pricing" },
];

export function GlobalNavbar({ showPrimaryAuthAction = true }: GlobalNavbarProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { supabase, session, isLoading } = useAuthSession();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  const displayName =
    session?.user.user_metadata?.display_name ||
    session?.user.user_metadata?.name ||
    session?.user.email?.split("@")[0] ||
    "Developer";

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
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-widest text-[#8B8B93] transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="flex items-center gap-2 text-[#8B8B93] transition-colors hover:text-white group">
          <Search size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium uppercase tracking-wider hidden sm:block">Search</span>
        </button>
        {!isLoading && !session && (
          <>
            <Link
              href="/auth?mode=signin"
              className="hidden text-xs uppercase tracking-widest text-[#a1a1aa] transition-colors hover:text-white sm:block"
            >
              Sign in
            </Link>
            {showPrimaryAuthAction && (
              <Link
                href="/auth?mode=signup"
                className="flex h-9 items-center rounded-full bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-black transition-colors hover:bg-[#e8e8ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Sign up
              </Link>
            )}
          </>
        )}
        {!isLoading && session && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label="Open account menu"
              className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] pl-2 pr-3 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06b6d4]/15 text-[#67e8f9]">
                <User size={13} aria-hidden="true" />
              </span>
              <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{displayName}</span>
              <ChevronDown size={13} className="text-white/45" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111114] p-2 shadow-2xl shadow-black/50">
                <div className="border-b border-white/[0.06] px-3 py-3">
                  <p className="truncate text-sm font-medium text-white">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-[#8B8B93]">{session.user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="mt-2 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm text-[#b4b4bb] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <LogOut size={15} aria-hidden="true" /> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.header>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">WHAT&apos;S HAPPENING</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">Discover the world in real time.</p>
          <a href="https://tin.computer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8B8B93] hover:text-white">
            <svg viewBox="0 0 32 32" className="h-[1em] w-[1em]" aria-hidden="true"><rect width="32" height="32" fill="#66DC9D" /></svg>
            Growth by Tin
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm text-[#8B8B93]">
          {["Explore", "Trending", "Countries", "Categories", "About", "Privacy", "Terms"].map((link) => (
            <Link key={link} href={link === "Trending" ? "/#trending" : "/"} className="hover:text-white transition-colors">
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

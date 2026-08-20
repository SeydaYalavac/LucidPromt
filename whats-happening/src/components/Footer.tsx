import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">WHAT&apos;S HAPPENING</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#8B8B93]">
            <p>Discover the world in real time.</p>
            <span aria-hidden="true" className="text-white/20">·</span>
            <Link href="https://tin.computer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <svg aria-hidden="true" viewBox="0 0 32 32" className="h-[1em] w-[1em]">
                <rect width="32" height="32" fill="#66DC9D" />
              </svg>
              Growth by Tin
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm text-[#8B8B93]">
          {["Explore", "Trending", "Countries", "Categories", "About", "Privacy", "Terms"].map((link) => (
            <Link key={link} href="#" className="hover:text-white transition-colors">
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

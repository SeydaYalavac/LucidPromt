import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">WHAT&apos;S HAPPENING</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">Discover the world in real time.</p>
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

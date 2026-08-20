import { AlertCircle, Radio } from "lucide-react";

export function TrendLoading({ compact = false }: { compact?: boolean }) {
  return <div className={`animate-pulse rounded-[1.75rem] border border-white/[0.05] bg-[#0D0D0F] ${compact ? "h-40" : "h-80"}`} aria-label="Loading trend records" />;
}

export function TrendUnavailable({ message = "Live trend data is waiting for its production connection." }: { message?: string }) {
  return <div className="rounded-[1.75rem] border border-white/[0.08] bg-[#0B0B0D] p-8 sm:p-10" role="status"><AlertCircle size={20} className="text-[#67E8F9]" /><h2 className="mt-5 text-xl font-medium text-white">The interface is ready. The live feed is not connected yet.</h2><p className="mt-3 max-w-[58ch] text-sm leading-6 text-[#9B9BA4]">{message} We stop here instead of showing sample stories as current events.</p></div>;
}

export function TrendEmpty({ message = "No trends match these filters yet." }: { message?: string }) {
  return <div className="rounded-[1.75rem] border border-dashed border-white/10 px-8 py-16 text-center"><Radio size={20} className="mx-auto text-white/35" /><p className="mt-4 text-sm text-[#9B9BA4]">{message}</p></div>;
}

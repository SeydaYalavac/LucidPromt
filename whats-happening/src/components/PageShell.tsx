import { Footer } from "./Footer";
import { GlobalNavbar } from "./GlobalNavbar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#F5F5F5]"><GlobalNavbar /><main>{children}</main><Footer /></div>;
}

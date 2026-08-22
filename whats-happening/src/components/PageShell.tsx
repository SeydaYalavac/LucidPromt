import { Footer } from "./Footer";
import { GlobalNavbar } from "./GlobalNavbar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen overflow-x-hidden bg-background text-foreground"><GlobalNavbar /><main>{children}</main><Footer /></div>;
}

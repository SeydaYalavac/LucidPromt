import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SignalMap } from "@/components/SignalMap";

export const metadata: Metadata = { title: "Signal map | What's Happening", description: "Explore country-attributed technology trends on an interactive world map." };
export default function MapPage() { return <PageShell><SignalMap /></PageShell>; }

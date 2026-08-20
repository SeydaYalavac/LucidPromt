import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProductAnalytics } from "@/components/ProductAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "What's Happening | Live Global Trend Intelligence",
  description: "Track emerging global trends, inspect the evidence, and understand why attention is moving now.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProductAnalytics />
        {children}
      </body>
    </html>
  );
}

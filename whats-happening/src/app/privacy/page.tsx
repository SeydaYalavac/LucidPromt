import type { Metadata } from "next";
import { LegalNoticePage } from "@/components/LegalNoticePage";
import { privacyNotice } from "@/content/legal-notices";

export const metadata: Metadata = {
  title: "Privacy notice | What's Happening",
  description: "How the current What's Happening product handles information.",
  alternates: { canonical: "https://www.whatshappeninginai.com/privacy" },
};

export default function PrivacyPage() {
  return <LegalNoticePage notice={privacyNotice} />;
}

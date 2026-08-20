import type { Metadata } from "next";
import { LegalNoticePage } from "@/components/LegalNoticePage";
import { termsNotice } from "@/content/legal-notices";

export const metadata: Metadata = {
  title: "Terms of use | What's Happening",
  description: "Current terms for using the What's Happening product.",
  alternates: { canonical: "https://www.whatshappeninginai.com/terms" },
};

export default function TermsPage() {
  return <LegalNoticePage notice={termsNotice} />;
}

"use client";

import { AlertCircle, Radio } from "lucide-react";
import { DemandSurvey } from "./DemandSurvey";
import { useLocale } from "@/i18n/locale";

export function TrendLoading({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return <div className={`editorial-card animate-pulse rounded-[1.75rem] border ${compact ? "h-40" : "h-80"}`} aria-label={t("state.loading")} />;
}

export function TrendUnavailable({
  message,
  showDemandSurvey = false,
}: {
  message?: string;
  showDemandSurvey?: boolean;
}) {
  const { t } = useLocale();
  return <div className="editorial-card rounded-[1.75rem] border p-8 sm:p-10"><div role="status"><AlertCircle size={20} className="text-white/55" /><h2 className="mt-5 text-xl font-medium text-white">{t("state.heading")}</h2><p className="mt-3 max-w-[58ch] text-sm leading-6 text-[#9B9BA4]">{message || t("state.unavailable")} {t("state.failClosed")}</p></div>{showDemandSurvey && <DemandSurvey />}</div>;
}

export function TrendEmpty({ message }: { message?: string }) {
  const { t } = useLocale();
  return <div className="editorial-card rounded-[1.75rem] border border-dashed px-8 py-16 text-center"><Radio size={20} className="mx-auto text-white/35" /><p className="mt-4 text-sm text-[#9B9BA4]">{message || t("state.empty")}</p></div>;
}

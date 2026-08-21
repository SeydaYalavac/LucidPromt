"use client";

import { useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { captureProductEvent } from "@/lib/analytics";
import {
  demandFeedbackCategories,
  type DemandFeedbackCategory,
} from "@/lib/feedback";

const STORAGE_KEY = "whats-happening:demand-survey-v1";
const SURVEY_CHANGE_EVENT = "demand-survey-change";

function subscribe(callback: () => void) {
  window.addEventListener(SURVEY_CHANGE_EVENT, callback);
  return () => window.removeEventListener(SURVEY_CHANGE_EVENT, callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "answered";
}

export function DemandSurvey() {
  const answered = useSyncExternalStore(subscribe, getSnapshot, () => true);
  const [justAnswered, setJustAnswered] = useState(false);

  function submit(category: DemandFeedbackCategory) {
    captureProductEvent("feedback_submitted", { category });
    window.localStorage.setItem(STORAGE_KEY, "answered");
    setJustAnswered(true);
    window.dispatchEvent(new Event(SURVEY_CHANGE_EVENT));
  }

  if (answered && !justAnswered) return null;

  if (justAnswered) {
    return (
      <p className="mt-7 flex min-h-11 items-center gap-2 border-t border-white/[0.08] pt-6 text-sm text-[#C9C9CF]" role="status">
        <Check size={16} className="text-[#67E8F9]" aria-hidden="true" />
        Thanks. Your category was recorded.
      </p>
    );
  }

  return (
    <fieldset className="mt-7 border-t border-white/[0.08] pt-6">
      <legend className="text-base font-medium text-white">
        What were you hoping to track?
      </legend>
      <p className="mt-2 text-sm leading-6 text-[#85858E]">
        Choose one category. No written response is collected.
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {demandFeedbackCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => submit(category.id)}
            className="min-h-11 rounded-full border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-[#D0D0D5] transition-colors hover:border-[#67E8F9]/45 hover:bg-[#67E8F9]/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
          >
            {category.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

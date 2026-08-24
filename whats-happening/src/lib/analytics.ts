import posthog from "posthog-js";
import { scrubAutomaticAcquisitionProperties } from "@/lib/analytics-privacy";
import { isCurrentSessionMarkedForProductionTest } from "@/lib/analytics-test-session";
import {
  buildSignupSourceEventProperties,
  deriveFirstReferrerChannel,
  isReferrerChannel,
  preserveFirstReferrerChannel,
  type ReferrerChannel,
  type SignupSource,
  type SignupSourceEventProperties,
} from "@/lib/signup-attribution";

const MANAGED_POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_Bdp4jGhnxUi3EiJUiWDT3WTYwYmBRDfR8u2wKpkBN2id";
const MANAGED_POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type ProductEventProperties = {
  "$pageview": {
    route: string;
    $current_url: string;
    first_referrer_channel?: ReferrerChannel;
  };
  signup_cta_clicked: { source: "auth_panel" | "global_nav" | "mobile_nav" };
  source_evidence_viewed: { trend_slug: string; source_type: string };
  trend_saved: { trend_slug: string; source: "category" | "country" | "detail" | "explore" | "trending" | "world" };
  live_data_unavailable: { endpoint: string; route: string; status_code: number };
  authentication_unavailable: { mode: string };
  api_error: {
    endpoint: string;
    failure_type: "http" | "network" | "invalid_response";
    status_code: number;
  };
  feedback_submitted: { category: string };
  signup_source: SignupSourceEventProperties;
  auth_attempted: { mode: string; provider: string };
  auth_completed: {
    mode: string;
    provider: string;
    success: boolean;
    failure_type?: string;
    requires_email_verification?: boolean;
  };
  user_authenticated: { provider: string };
  developer_chat_message_sent: { trend_slug: string };
  developer_chat_message_failed: { trend_slug: string; status_code: number };
};

let initialized = false;
const capturedOnce = new Set<string>();
const FIRST_REFERRER_CHANNEL_PROPERTY = "first_referrer_channel";

export function initProductAnalytics() {
  if (typeof window === "undefined") return false;

  if (isCurrentSessionMarkedForProductionTest()) {
    if (initialized) posthog.stopSessionRecording();
    return false;
  }

  if (initialized) return true;

  posthog.init(MANAGED_POSTHOG_KEY, {
    api_host: MANAGED_POSTHOG_HOST,
    autocapture: {
      capture_copied_text: false,
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
      css_selector_ignorelist: [
        ".ph-no-autocapture",
        "[data-ph-no-autocapture]",
        ".ph-no-capture",
      ],
    },
    rageclick: {
      content_ignorelist: true,
      ignore_text_selection: true,
    },
    capture_exceptions: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: false,
    mask_all_element_attributes: true,
    mask_all_text: true,
    person_profiles: "identified_only",
    session_recording: {
      blockSelector: ".ph-no-capture",
      maskAllElementAttributes: true,
      maskAllInputs: true,
      maskCapturedNetworkRequestFn: () => null,
      maskTextSelector: "*",
      recordBody: false,
      recordHeaders: false,
    },
    before_send: (event) => {
      if (isCurrentSessionMarkedForProductionTest()) return null;
      // Autocapture powers PostHog's rage-click detector, but broad click events are
      // intentionally discarded. Only the privacy-masked $rageclick event is kept.
      if (event?.event === "$autocapture") return null;
      if (!event?.properties) return event;
      scrubAutomaticAcquisitionProperties(event.properties);
      return event;
    },
  });
  const referrerChannel = preserveFirstReferrerChannel(
    posthog.get_property(FIRST_REFERRER_CHANNEL_PROPERTY),
    deriveFirstReferrerChannel(document.referrer, window.location.href),
  );
  if (referrerChannel) {
    posthog.register_once({ [FIRST_REFERRER_CHANNEL_PROPERTY]: referrerChannel });
  }
  posthog.startSessionRecording(true);
  initialized = true;
  return true;
}

export function captureProductEvent<EventName extends keyof ProductEventProperties>(
  event: EventName,
  properties: ProductEventProperties[EventName],
) {
  if (!initProductAnalytics()) return;
  posthog.capture(event, properties);
}

export function captureProductEventOnce<
  EventName extends keyof ProductEventProperties,
>(
  dedupeKey: string,
  event: EventName,
  properties: ProductEventProperties[EventName],
) {
  if (capturedOnce.has(dedupeKey)) return;
  if (!initProductAnalytics()) return;
  capturedOnce.add(dedupeKey);
  captureProductEvent(event, properties);
}

export function identifyProductUser(userId: string) {
  if (!initProductAnalytics()) return;
  posthog.identify(userId);
}

export function getFirstReferrerChannel(): ReferrerChannel | undefined {
  if (!initProductAnalytics()) return undefined;
  const storedReferrerChannel = posthog.get_property(FIRST_REFERRER_CHANNEL_PROPERTY);
  return isReferrerChannel(storedReferrerChannel) ? storedReferrerChannel : undefined;
}

export function captureSignupSource(source: SignupSource) {
  if (!initProductAnalytics()) return;
  const referrerChannel = getFirstReferrerChannel();
  posthog.capture(
    "signup_source",
    buildSignupSourceEventProperties(source, referrerChannel),
  );
}

export function resetProductUser() {
  if (!initProductAnalytics()) return;
  posthog.reset();
}

export function stableRouteName(pathname: string) {
  if (/^\/trend\/[^/]+$/.test(pathname)) return "/trend/[slug]";
  if (/^\/category\/[^/]+$/.test(pathname)) return "/category/[category]";
  if (/^\/country\/[^/]+$/.test(pathname)) return "/country/[country]";
  return pathname;
}

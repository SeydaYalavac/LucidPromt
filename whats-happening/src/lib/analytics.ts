import posthog from "posthog-js";

const MANAGED_POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_Bdp4jGhnxUi3EiJUiWDT3WTYwYmBRDfR8u2wKpkBN2id";
const MANAGED_POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type ProductEventProperties = {
  "$pageview": { route: string; $current_url: string };
  signup_cta_clicked: { source: "auth_panel" | "global_nav" | "mobile_nav" };
  source_evidence_viewed: { trend_slug: string; source_type: string };
  trend_saved: { trend_slug: string; source: "detail" | "explore" | "trending" | "world" };
  live_data_unavailable: { endpoint: string; route: string; status_code: number };
  authentication_unavailable: { mode: string };
  api_error: {
    endpoint: string;
    failure_type: "http" | "network" | "invalid_response";
    status_code: number;
  };
  feedback_submitted: { category: string };
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

function withoutQueryOrHash(value: unknown) {
  if (typeof value !== "string") return value;
  if (value.startsWith("$")) return value;
  try {
    const url = new URL(value, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

function scrubAutomaticUrlProperties(properties: Record<string, unknown>) {
  for (const key of [
    "$current_url",
    "$initial_current_url",
    "$referrer",
    "$initial_referrer",
    "$session_entry_url",
    "$session_entry_referrer",
  ]) {
    properties[key] = withoutQueryOrHash(properties[key]);
  }

  const initialPersonInfo = properties.$initial_person_info;
  if (initialPersonInfo && typeof initialPersonInfo === "object") {
    const values = initialPersonInfo as Record<string, unknown>;
    values.r = withoutQueryOrHash(values.r);
    values.u = withoutQueryOrHash(values.u);
  }

  const clientSessionProps = properties.$client_session_props;
  if (clientSessionProps && typeof clientSessionProps === "object") {
    const values = clientSessionProps as { props?: Record<string, unknown> };
    if (values.props) {
      values.props.r = withoutQueryOrHash(values.props.r);
      values.props.u = withoutQueryOrHash(values.props.u);
    }
  }
}

export function initProductAnalytics() {
  if (initialized || typeof window === "undefined") return;

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
      // Autocapture powers PostHog's rage-click detector, but broad click events are
      // intentionally discarded. Only the privacy-masked $rageclick event is kept.
      if (event?.event === "$autocapture") return null;
      if (!event?.properties) return event;
      scrubAutomaticUrlProperties(event.properties);
      return event;
    },
  });
  posthog.startSessionRecording(true);
  initialized = true;
}

export function captureProductEvent<EventName extends keyof ProductEventProperties>(
  event: EventName,
  properties: ProductEventProperties[EventName],
) {
  initProductAnalytics();
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
  capturedOnce.add(dedupeKey);
  captureProductEvent(event, properties);
}

export function identifyProductUser(userId: string) {
  initProductAnalytics();
  posthog.identify(userId);
}

export function resetProductUser() {
  initProductAnalytics();
  posthog.reset();
}

export function stableRouteName(pathname: string) {
  if (/^\/trend\/[^/]+$/.test(pathname)) return "/trend/[slug]";
  if (/^\/category\/[^/]+$/.test(pathname)) return "/category/[category]";
  if (/^\/country\/[^/]+$/.test(pathname)) return "/country/[country]";
  return pathname;
}

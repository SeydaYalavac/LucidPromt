import posthog from "posthog-js";

const MANAGED_POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_Bdp4jGhnxUi3EiJUiWDT3WTYwYmBRDfR8u2wKpkBN2id";
const MANAGED_POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type ProductEventProperties = {
  "$pageview": { route: string; $current_url: string };
  signup_cta_clicked: { source: "auth_panel" | "global_nav" | "mobile_nav" };
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

function withoutQueryOrHash(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

export function initProductAnalytics() {
  if (initialized || typeof window === "undefined") return;

  posthog.init(MANAGED_POSTHOG_KEY, {
    api_host: MANAGED_POSTHOG_HOST,
    autocapture: false,
    capture_exceptions: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: "identified_only",
    before_send: (event) => {
      if (!event?.properties) return event;
      event.properties.$current_url = withoutQueryOrHash(event.properties.$current_url);
      event.properties.$referrer = withoutQueryOrHash(event.properties.$referrer);
      event.properties.$initial_referrer = withoutQueryOrHash(
        event.properties.$initial_referrer,
      );
      return event;
    },
  });
  initialized = true;
}

export function captureProductEvent<EventName extends keyof ProductEventProperties>(
  event: EventName,
  properties: ProductEventProperties[EventName],
) {
  initProductAnalytics();
  posthog.capture(event, properties);
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
